const binding = require('../binding')

export class Iterator {
  #lock?: Promise<any>

  context; cache
  finished: boolean
  db
  constructor(db, options) {
    this.db = db
    this.context = binding.iterator_init(db.context, options)
    this.cache = null
    this.finished = false
  }

  /**
   * Seek to a position
   * @param target Key to seek to. Empty string for start or end if reversed.
   */
  seek(target) {
    if (target == null) throw Error('invalid seek target')
    binding.iterator_seek(this.context, target)
    this.finished = false
  }

  private _next(): Promise<any> {
    return new Promise((res, rej) => {
      binding.iterator_next(this.context, (err, array, finished) => {
        if (err) {
          rej(err)
        } else {
          this.finished = finished
          res({ array, finished })
        }
      })
    })
  }

  async next() {
    if (this.#lock) await this.#lock
    if (this.finished) return null
    this.#lock = this._next()
    const val = await this.#lock
    this.#lock = null
    return val.finished ? null : val.array
  }

  end() {
    return new Promise((res, rej) => {
      delete this.cache
      binding.iterator_end(this.context, err => err ? rej(err) : res(true))
    })
  }

  // 

  static readonly rangeOptions = 'start end gt gte lt lte'.split(' ')

  static isRangeOption (k) {
    return Iterator.rangeOptions.indexOf(k) !== -1
  }

  static cleanRangeOptions (options) {
    var result = {}
  
    for (var k in options) {
      if (!Object.prototype.hasOwnProperty.call(options, k)) continue
  
      var opt = options[k]
  
      if (this.isRangeOption(k)) {
        // Note that we don't reject nullish and empty options here. While
        // those types are invalid as keys, they are valid as range options.
        opt = Buffer.isBuffer(opt) ? opt : String(opt)
      }
  
      result[k] = opt
    }
  
    return result
  }

  static _setupIteratorOptions(options: any = {}) {
    this.cleanRangeOptions(options)
    options.reverse = !!options.reverse
    options.keys = options.keys !== false
    options.values = options.values !== false
    options.limit = 'limit' in options ? options.limit : -1
    options.keyAsBuffer = options.keyAsBuffer !== false
    options.valueAsBuffer = options.valueAsBuffer !== false
  }
}
