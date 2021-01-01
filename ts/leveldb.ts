import { ChainedBatch } from "./chainedBatch"
import { Iterator } from "./iterator"

const binding = require('../binding')

export type LevelDBOptions = {
  bufferKeys?: boolean
  snapshots?: boolean
  permanence?: true
  seek?: true
  clear?: true
  createIfMissing?: true
  errorIfExists?: true
  additionalMethods?: {
    approximateSize?: true
    compactRange?: true
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

export class LevelDB implements DB {
  context
  path: string
  options: LevelDBOptions
  status: string

  constructor(path: string, options: LevelDBOptions) {
    this.context = binding.db_init()
    this.path = path
    this.options = options
    this.status = 'closed'
  }

  async open() {
    return new Promise((res, rej) => {
      binding.db_open(this.context, this.path, this.options, (err) => err ? rej(err) : res(true))
      this.status = 'open'
      console.debug('DB was opened!')
    })
  }

  async close() {
    return new Promise((res, rej) => 
      binding.db_close(this.context, (err) => err ? rej(err) : res(true))
    )
  }

  static serializeKey(key) {
    return Buffer.isBuffer(key) ? key : String(key)
  }

  static serializeValue(value) {
    return Buffer.isBuffer(value) ? value : String(value)
  }

  put(key: Buffer | string, value: Buffer | string, options: OpOpts = {}) {
    return new Promise((res, rej) => {
      binding.db_put(this.context, key, value, options, err => err ? rej(err) : res(true))
    })
  }

  get(key: Buffer | string, options: OpOpts = {}) {
    return new Promise((res, rej) => {
      binding.db_get(this.context, key, options, (err, val) => err ? rej(err) : res(val))
    })
  }

  async getAsString(key, options) {
    return String(await this.get(key, options))
  }

  delete(key: Buffer | string, value: Buffer | string, options: OpOpts = {}) {
    return new Promise((res, rej) => {
      binding.db_del(this.context, key, options, err => err ? rej(err) : res(true))
    })
  }

  chainedBatch() {
    return new ChainedBatch(this)
  }

  batch(operations: Operation[], options: OpOpts = {}) {
    return new Promise((res, rej) => {
      binding.batch_do(this.context, operations, options, err => err ? rej(err) : res(true))
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
    console.warn('using options', options)
    return new Iterator(this, options)
  }
  // 


  /**
   * destroy() is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory rm if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.
   * The callback will be called when the destroy operation is complete, with a possible error argument.
   */
  destroy(location) {
    return new Promise((res, rej) => 
      binding.destroy_db(location, err => err ? rej(err) : res(true))
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
      binding.repair_db(location, err => err ? rej(err) : res(true))    
    )
  }
}