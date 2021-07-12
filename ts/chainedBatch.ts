const binding = require('../binding')

export class ChainedBatch {
  context

  constructor (db) {
    this.context = db.context
  }

  put (key: Buffer, value: Buffer) {
    binding.batch_put(this.context, key, value)
  }

  delete (key: Buffer) {
    binding.batch_del(this.context, key)
  }

  clear () {
    binding.batch_clear(this.context)
  }

  async write (options) {
    return await new Promise((res, rej) => {
      binding.batch_write(this.context, options, err => err ? rej(err) : res(err))
    })
  }
}
