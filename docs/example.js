const { LevelDB } = require('leveldb-zlib')

async function basicTest (pathToDb) {
  const db = new LevelDB(pathToDb, { createIfMissing: true })
  await db.open() // Make sure to wait for DB to open!
  await db.put('Key', 'Value')
  const val = await db.getAsString('Key')
  console.assert(val === 'Value')
  await db.close() // Make sure to save and close when you're done!
}

async function iterate (pathToDb) {
  const db = new LevelDB(pathToDb)
  await db.open() // Make sure to wait for DB to open!
  const iter = db.getIterator({ values: true, keys: true }) // Both `keys` and `values` default to true
  let entry
  while (entry = await iter.next()) {
    const [val, key] = entry.map(k => String(k))
    console.log('Read', key, val)
  }
  await db.close() // Make sure to save and close when you're done!
}

basicTest('./testdb').then(() => iterate('./testdb'))
