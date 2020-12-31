const binding = require('../binding')

export class Iterator {
  context; cache
  finished: boolean
  db
  constructor(db, options) {
    this.db = db
    this.context = binding.iterator_init(db.context, options)
    this.cache = null
    this.finished = false
  }

  seek(target) {
    if (target.length === 0) {
      throw new Error('cannot seek() to an empty target')
    }

    this.cache = null
    binding.iterator_seek(this.context, target)
    this.finished = false
  }

  _next() {
    return new Promise((res, rej) => {
      binding.iterator_next(this.context, (err, array, finished) => {
        if (err) {
          rej(err)
        } else {
          this.cache = array
          this.finished = finished
          res(true)
        }
      })
    })
  }

  async next() {
    if (this.cache && this.cache.length) {
      return [ this.cache.pop(), this.cache.pop() ]
    } else if (this.finished) {
      return null
    } else {
      try {
        await this._next()
        return [ this.cache.pop(), this.cache.pop() ]
      } catch {
        return null
      }
    }
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
