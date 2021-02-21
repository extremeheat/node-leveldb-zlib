import { ChainedBatch } from "./chainedBatch"
import { Iterator } from "./iterator"

const binding = require('../binding')
const debug = require('debug')('leveldb')

export type LevelDBOptions = {
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

export type Operation = {
  type: 'del' | 'put',
  key: Buffer | string,
  value?: Buffer | string
}

export type OpOpts = { sync?: boolean }

export type IterOpts = {
  reverse?: boolean, keys?: boolean, values?: boolean, fillCache?: boolean,
  keyAsBuffer?: boolean, valueAsBuffer?: boolean, limit?: number,
  highWaterMark?: boolean, end?
  lt?, lte?, gt?, gte?
}

interface DB {

}

globalThis.levelDbOpened = globalThis.levelDbOpened || new Set()

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class LevelDB implements DB {
  context
  path: string
  options: LevelDBOptions
  status: string

  constructor(path: string, options: LevelDBOptions = {}) {
    this.context = binding.db_init()
    this.path = path
    this.options = options
    this.status = 'closed'
  }

  async open() {
    if (globalThis.levelDbOpened.has(this.path)) {
      throw new Error('DB already has an open context, did you close it properly?')
    }
    globalThis.levelDbOpened.add(this.path)
    await delay(100) // (mostly) unnoticeable hack to fix race bugs in bindings (#1)
    return new Promise((res, rej) => {
      binding.db_open(this.context, this.path, this.options, (err) => {
        if (err) {
          console.warn('[leveldb] Failed to open db ', this.path, this.options, err)
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

  isOpen(): boolean {
    return this.status === 'open'
  }

  async close() {
    if (!this.isOpen()) return
    return new Promise((res, rej) =>
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

  static serializeKey(key) {
    return Buffer.isBuffer(key) ? key : String(key)
  }

  static serializeValue(value) {
    return Buffer.isBuffer(value) ? value : String(value)
  }

  put(key: Buffer | string, value: Buffer | string, options: OpOpts = {}): Promise<boolean> {
    if (this.status !== 'open') throw new Error('DB is not open')
    if (!key.length) throw new Error('Empty key')
    return new Promise((res, rej) => {
      binding.db_put(this.context, key, value, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  get(key: Buffer | string, options: OpOpts = {}): Promise<Buffer | null> {
    if (this.status !== 'open') throw new Error('DB is not open')
    if (!key.length) throw new Error('Empty key')
    return new Promise((res, rej) => {
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

  async getAsString(key: Buffer | string, options: OpOpts = {}): Promise<string> {
    return String(await this.get(key, options))
  }

  delete(key: Buffer | string, options: OpOpts = {}): Promise<boolean> {
    return new Promise((res, rej) => {
      binding.db_del(this.context, key, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  chainedBatch() {
    return new ChainedBatch(this)
  }

  batch(operations: Operation[], options: OpOpts = {}): Promise<boolean> {
    return new Promise((res, rej) => {
      binding.batch_do(this.context, operations, options, err => err ? rej(Error(err)) : res(true))
    })
  }

  approximateSize(start, end, callback) {
    if (start == null ||
      end == null ||
      typeof start === 'function' ||
      typeof end === 'function') {
      throw new Error('approximateSize() requires valid `start` and `end` arguments')
    }

    if (typeof callback !== 'function') {
      throw new Error('approximateSize() requires a callback argument')
    }

    start = LevelDB.serializeKey(start)
    end = LevelDB.serializeKey(end)

    binding.db_approximate_size(this.context, start, end, callback)
  }

  compactRange(start, end, callback) {
    if (start == null ||
      end == null ||
      typeof start === 'function' ||
      typeof end === 'function') {
      throw new Error('compactRange() requires valid `start` and `end` arguments')
    }

    if (typeof callback !== 'function') {
      throw new Error('compactRange() requires a callback argument')
    }

    start = LevelDB.serializeKey(start)
    end = LevelDB.serializeKey(end)

    binding.db_compact_range(this.context, start, end, callback)
  }

  getProperty(property) {
    return binding.db_get_property(this.context, property)
  }


  // 
  getIterator(options: IterOpts = {}) {
    if (this.status !== 'open') {
      // Prevent segfault
      throw new Error('cannot call iterator() before open()')
    }
    Iterator._setupIteratorOptions(options)
    debug('iter using options', options)
    return new Iterator(this, options)
  }
  // 


  /**
   * destroy() is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory rm if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.
   * The callback will be called when the destroy operation is complete, with a possible error argument.
   */
  destroy(location) {
    return new Promise((res, rej) =>
      binding.destroy_db(location, err => err ? rej(Error(err)) : res(true))
    )
  }

  /**
   * repair() can be used to attempt a restoration of a damaged LevelDB store. From the LevelDB documentation:
   * 
   * If a DB cannot be opened, you may attempt to call this method to resurrect as much of the contents of the database as possible. Some data may be lost, so be careful when calling this function on a database that contains important information.
   * 
   * You will find information on the repair operation in the LOG file inside the store directory.
   * 
   * A repair() can also be used to perform a compaction of the LevelDB log into table files.
   * The callback will be called when the repair operation is complete, with a possible error argument.
   */
  repair(location: string) {
    return new Promise((res, rej) =>
      binding.repair_db(location, err => err ? rej(Error(err)) : res(true))
    )
  }
}