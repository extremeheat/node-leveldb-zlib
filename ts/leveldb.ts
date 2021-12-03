import { ChainedBatch } from './chainedBatch'
import { Iterator } from './iterator'

const binding = require('../binding')
const debug = require('debug')('leveldb')

export interface LevelDBOptions {
  bufferKeys?: boolean
  snapshots?: boolean
  permanence?: boolean
  seek?: boolean
  clear?: boolean
  createIfMissing?: boolean
  errorIfExists?: boolean
  additionalMethods?: {
    approximateSize?: boolean
    compactRange?: boolean
  }
}

export interface Operation {
  type: 'del' | 'put'
  key: Buffer | string
  value?: Buffer | string
}

export interface OpOpts { sync?: boolean }

export interface IterOpts {
  reverse?: boolean, keys?: boolean, values?: boolean, fillCache?: boolean,
  keyAsBuffer?: boolean, valueAsBuffer?: boolean, limit?: number,
  highWaterMark?: boolean, end?
  lt?, lte?, gt?, gte?
}

// Delete all entries or a range. Not guaranteed to be atomic. Accepts the following range options (with the same rules as on iterators):
export interface ClearOpts {
  gt?, gte?, // (greater than), gte (greater than or equal) define the lower bound of the range to be deleted. Only entries where the key is greater than (or equal to) this option will be included in the range. When reverse=true the order will be reversed, but the entries deleted will be the same.
  lt?, lte?, // lte (less than or equal) define the higher bound of the range to be deleted. Only entries where the key is less than (or equal to) this option will be included in the range. When reverse=true the order will be reversed, but the entries deleted will be the same.
  reverse: boolean, // delete entries in reverse order. Only effective in combination with limit, to remove the last N records.
  limit: number, // limit the number of entries to be deleted. This number represents a maximum number of entries and may not be reached if you get to the end of the range first. A value of -1 means there is no limit. When reverse=true the entries with the highest keys will be deleted instead of the lowest keys.
}

globalThis.levelDbOpened = globalThis.levelDbOpened || new Set()

async function delay (ms) {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

export class LevelDB {
  context
  path: string
  options: LevelDBOptions
  status: string

  constructor (path: string, options: LevelDBOptions = {}) {
    this.context = binding.db_init()
    this.path = path
    this.options = options
    this.status = 'closed'
  }

  /**
   * Opens the database.
   * @returns {Promise} Resolves when the database has been opened.
   */
  async open () {
    if (globalThis.levelDbOpened.has(this.path)) {
      throw new Error('DB already has an open context, did you close it properly?')
    }
    globalThis.levelDbOpened.add(this.path)
    await delay(100) // (mostly) unnoticeable hack to fix race bugs in bindings (#1)
    return await new Promise((res, rej) => {
      binding.db_open(this.context, this.path, this.options, (err) => {
        if (err) {
          debug('[leveldb] Failed to open db ', this.path, this.options, err)
          rej(Error(err))
        } else {
          this.status = 'open'
          debug('[leveldb] DB was opened at: ', this.path)
          globalThis.levelDbOpened.add(this.path)
          res(true)
        }
      })
    })
  }

  isOpen (): boolean {
    return this.status === 'open'
  }

  /**
   * Closes the database.
   * @returns {Promise} Resolves when the database has been opened.
   */
  async close () {
    if (!this.isOpen()) {
      this.status = 'closed'
      globalThis.levelDbOpened.delete(this.path)
      return
    }
    return await new Promise((res, rej) =>
      binding.db_close(this.context, (err) => {
        if (err) {
          rej(Error(err))
        } else {
          this.status = 'closed'
          globalThis.levelDbOpened.delete(this.path)
          res(true)
        }
      })
    )
  }

  static serializeKey (key) {
    return Buffer.isBuffer(key) ? key : String(key)
  }

  static serializeValue (value) {
    return Buffer.isBuffer(value) ? value : String(value)
  }

  async put (key: Buffer | string, value: Buffer | string, options: OpOpts = {}): Promise<boolean> {
    if (this.status !== 'open') throw new Error('DB is not open')
    if (!key.length) throw new Error('Empty key')
    return await new Promise((res, rej) => {
      binding.db_put(this.context, key, value, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  async get (key: Buffer | string, options: OpOpts = {}): Promise<Buffer | null> {
    if (this.status !== 'open') throw new Error('DB is not open')
    if (!key.length) throw new Error('Empty key')
    return await new Promise((res, rej) => {
      binding.db_get(this.context, key, options, (err, val) => {
        if (err) {
          if (err.message.includes('NotFound')) {
            return res(null)
          }
          return rej(new Error(err))
        } else {
          return res(val)
        }
      })
    })
  }

  async getAsString (key: Buffer | string, options: OpOpts = {}): Promise<string> {
    return String(await this.get(key, options))
  }

  async delete (key: Buffer | string, options: OpOpts = {}): Promise<boolean> {
    return await new Promise((res, rej) => {
      binding.db_del(this.context, key, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  chainedBatch () {
    return new ChainedBatch(this)
  }

  async batch (operations: Operation[], options: OpOpts = {}): Promise<boolean> {
    return await new Promise((res, rej) => {
      binding.batch_do(this.context, operations, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  async approximateSize (start, end) {
    if (start == null ||
      end == null ||
      typeof start === 'function' ||
      typeof end === 'function') {
      throw new Error('approximateSize() requires valid `start` and `end` arguments')
    }

    start = LevelDB.serializeKey(start)
    end = LevelDB.serializeKey(end)

    return await new Promise((res: any, rej) => binding.db_approximate_size(this.context, start, end, (err, ...a) => err ? rej(Error(err)) : res(...a)))
  }

  async compactRange (start, end) {
    if (start == null || end == null || typeof start === 'function' || typeof end === 'function') {
      throw new Error('compactRange() requires valid `start` and `end` arguments')
    }

    start = LevelDB.serializeKey(start)
    end = LevelDB.serializeKey(end)

    return await new Promise((res: any, rej) => binding.db_compact_range(this.context, start, end, (err, ...a) => err ? rej(Error(err)) : res(...a)))
  }

  getProperty (property) {
    return binding.db_get_property(this.context, property)
  }

  /**
   * Creates a new iterator with the specified options.
   * @param options Iterator options
   * @returns {Iterator}
   */
  getIterator (options: IterOpts = {}) {
    if (this.status !== 'open') {
      throw new Error('cannot call iterator() before open()')
    }
    Iterator._setupIteratorOptions(options)
    debug('iter using options', options)
    return new Iterator(this, options)
  }

  async * [Symbol.asyncIterator] () {
    const it = this.getIterator()
    let next
    while (next = await it.next()) {
      const [value, key] = next
      yield [key, value]
    }
  }

  /**
   * Delete all entries or a range.
   */
  async clear (options: ClearOpts) {
    return await new Promise((res, rej) => binding.clear(this.context, options, err => err ? rej(Error(err)) : res(true)))
  }

  /**
   * destroy() is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory rm if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.
   * The callback will be called when the destroy operation is complete, with a possible error argument.
   */
  static async destroy (location) {
    return await new Promise((res, rej) => binding.destroy_db(location, err => err ? rej(Error(err)) : res(true)))
  }

  /**
   * repair() can be used to attempt a restoration of a damaged LevelDB store. From the LevelDB documentation:
   *
   * If a DB cannot be opened, you may attempt to call this method to resurrect as much of the contents of the database as possible. Some data may be lost, so be careful when calling this function on a database that contains important information.
   *
   * You will find information on the repair operation in the LOG file inside the store directory.
   *
   * A repair() can also be used to perform a compaction of the LevelDB log into table files.
   */
  static async repair (location: string) {
    return await new Promise((res, rej) =>
      binding.repair_db(location, err => err ? rej(Error(err)) : res(true))
    )
  }
}
