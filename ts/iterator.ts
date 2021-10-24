const binding = require('../binding')

export class Iterator {
  #lock?: Promise<any>

  context
  cache = []
  finished = false
  db

  constructor (db, options) {
    this.db = db
    this.context = binding.iterator_init(db.context, options)
  }

  /**
   * Seek to a position
   * @param target Key to seek to. Empty string for start or end if reversed.
   */
  seek (target) {
    if (target == null) throw Error('invalid seek target')
    binding.iterator_seek(this.context, target)
    this.finished = false
  }

  private async _next (): Promise<any> {
    return await new Promise((res, rej) => {
      binding.iterator_next(this.context, (err, array, finished) => {
        if (err) {
          rej(err)
        } else {
          this.cache = array
          this.finished = finished
          res(null)
        }
      })
    })
  }

  async next () {
    if (this.#lock) await this.#lock
    if (this.cache.length > 0) return this.cache.splice(-2, 2)
    if (this.finished) return null
    await (this.#lock = this._next())
    this.#lock = null
    return this.cache.length ? this.cache.splice(-2, 2) : null
  }

  async end () {
    return await new Promise((res, rej) => {
      delete this.cache
      binding.iterator_end(this.context, err => err ? rej(err) : res(true))
    })
  }

  //

  static readonly rangeOptions = 'start end gt gte lt lte'.split(' ')

  static isRangeOption (k) {
    return Iterator.rangeOptions.includes(k)
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

  static _setupIteratorOptions (options: any = {}) {
    this.cleanRangeOptions(options)
    options.reverse = !!options.reverse
    options.keys = options.keys !== false
    options.values = options.values !== false
    options.limit = 'limit' in options ? options.limit : -1
    options.keyAsBuffer = options.keyAsBuffer !== false
    options.valueAsBuffer = options.valueAsBuffer !== false
  }
}
