const binding = require('../binding')

export class ChainedBatch {
  context
  
  constructor(db) {
    this.context = db.context
  }

  put(key, value) {
    binding.batch_put(this.context, key, value)
  }

  delete(key) {
    binding.batch_del(this.context, key)
  }

  clear() {
    binding.batch_clear(this.context)
  }

  write(options) {
    return new Promise((res, rej) => {
      binding.batch_write(this.context, options, err => err ? rej(err) : res(err))
    })
  }
}
