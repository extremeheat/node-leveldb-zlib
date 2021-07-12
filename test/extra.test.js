/* eslint-env mocha */
const { LevelDB } = require('leveldb-zlib')
const assert = require('assert')
const fs = require('fs')
const sleep = require('timers/promises').setTimeout

async function testRepair () {
  // Erase any existing DB
  try { fs.rmSync('./db', { recursive: true }) } catch {}
  // Make a new DB, write some stuff in it
  const db = new LevelDB('./db', { createIfMissing: true })
  await db.open()
  for (let i = 0; i < 10; i++) {
    await db.put('hello' + i, 'world!')
    assert.strictEqual(String(await db.get('hello' + i)), 'world!')
  }
  await db.close()

  // Wait a bit
  await sleep(100, 'result')

  // Corrupt the DB by deleting a file
  const ldbFile = fs.readdirSync('./db').find(name => name.startsWith('MANIFEST'))
  if (!ldbFile) throw Error('did not make DB')
  console.log('Deleting ', ldbFile)
  fs.renameSync('./db/' + ldbFile, './db/del-' + ldbFile)

  // Make sure we throw trying to open it again
  let threw, _db
  try {
    _db = new LevelDB('./db')
    await _db.open()
  } catch (e) {
    threw = true
    console.log('OK, threw')
  } finally {
    await _db.close()
  }
  if (!threw) {
    throw Error('Database did not throw error on open after deleting a file in it')
  }

  // Repair the DB
  const db2 = await LevelDB.repair('./db')
  console.log('Repaired!', db2)

  // Try to open it again, should work
  const db3 = await new LevelDB('./db')
  await db3.open()
  await db3.close()
  return true
}

async function testDestory () {
  // Erase any existing DB
  try { fs.rmSync('./db', { recursive: true }) } catch {}
  // Create a new DB, then destory it
  const db = new LevelDB('./db', { createIfMissing: true })
  await db.open()
  await db.close()
  console.log('Destroying', db)
  await LevelDB.destroy('./db')

  await sleep(1000)

  // Make sure we error now
  let db2
  try {
    db2 = new LevelDB('./db', { createIfMissing: false })
    await db2.open()
  } catch (e) {
    console.log('OK. Expected error:', e)
    return true
  } finally {
    await db2.close()
  }
  throw Error('did not throw when trying to open destroyed db')
}

it('can repair broken databases', async function () {
  await testRepair()
})

it('can destroy databases', async function () {
  await testDestory()
})
