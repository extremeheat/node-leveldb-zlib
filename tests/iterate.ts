const { assert } = require('assert');
const { LevelDB } = require('..')
const fs = require('fs')
const cp = require('child_process')

function rmdir(f) {
  if (process.platform == 'win32') {
    cp.execSync('rmdir /s /q ' + __dirname + f.replace('./', '\\'))
  } else {
    cp.execSync('rm -fr ' + __dirname.replace('./', '/') + f)
  }
}

async function testIterate() {
  let db = new LevelDB('test', { createIfMissing: true })
  try {
    await db.open()
  } catch (e) {
    await db.close()
    throw e
  }

  await db.put('Hello', 'World!')
  await db.put('I', 'Like')
  let f32a = new Float32Array(10)
  for (var i = 0; i < 10; i++) {
    f32a[i] = (3.14159 * Math.random())
  }
  // console.log('f32a', f32a)
  await db.put('Pi', Buffer.from(f32a.buffer))

  let Hello = await db.get('Hello')
  let I = await db.get('I')
  let Pi = await db.get('Pi')
  let pi = new Float32Array(Pi.buffer)
  // console.log(f32a, pi)

  if (String(Hello) !== 'World!') throw 'hello mismatch';
  if (f32a.toString() !== pi.toString()) throw 'pi mismatch';

  await db.close()
}

async function runTest(i, create) {
  let db = new LevelDB('test' + i, { createIfMissing: create })
  try {
    await db.open()
  } catch (e) {
    console.log("Caught Exception", e)
    return
  }
  console.log('Opened!')
  await db.put('hello', 'world')
  console.log('Put!')
  let ret = await db.get('hello')
  console.log('Got', ret)
  console.assert(ret == 'world')
  await db.close()
  return i
}

async function testMinecraft(path) {

  enum Tag {
    VersionNew = 44,
    Data2D = 45,
    Data2DLegacy = 46,
    SubChunkPrefix = 47,
    LegacyTerrain = 48,
    BlockEntity = 49,
    Entity = 50,
    PendingTicks = 51,
    BlockExtraData = 52,
    BiomeState = 53,
    FinalizedState = 54,
    HardCodedSpawnAreas = 57,
    VersionOld = 118
  };

  function readKey(buffer: Buffer) {
    let offset = 0
    let read = []

    let ksize = buffer.length
    // console.log(ksize)
    if (ksize >= 8) {
      let cx = buffer.readInt32LE(0)
      let cz = buffer.readInt32LE(4)
      let tagOver = buffer[8]
      let tagWithDim = buffer[12]

      let dim = 0

      let overworld = ksize == 9
      let otherDim = ksize == 13

      if (otherDim) {
        dim = buffer.readInt32LE(8)
      }

      // console.log('good', cx, cz, tagOver, tagWithDim, dim, overworld, otherDim)

      if (overworld && tagOver == Tag.VersionNew) {
        // Version 1.16.100+
        read.push({ x: cx, z: cz, dim: 0, type: 'version', key: buffer })
      } else if (otherDim && tagWithDim == Tag.VersionNew) {
        // Version
        read.push({ x: cx, z: cz, dim: dim, type: 'version', key: buffer })
      } else if (ksize == 10 && tagOver == Tag.SubChunkPrefix) {
        // Overworld chunk with subchunk
        let cy = buffer.readInt8(8)
        read.push({ x: cx, z: cz, y: cy, dim: dim, type: 'chunk', key: buffer })
      } else if (ksize == 14 && tagWithDim == Tag.SubChunkPrefix) {
        // let dim = buffer.readInt32LE(offset += 4)
        let cy = buffer.readInt8(8 + 4)
        read.push({ x: cx, z: cz, y: cy, dim: dim, type: 'chunk', key: buffer })
      } else if (otherDim && tagWithDim == Tag.Data2D) {
        // biomes and elevation for other dimensions
        read.push({ x: cx, z: cz, dim: dim, type: 'data2d', key: buffer })
      } else if (overworld && tagOver == Tag.Data2D) {
        // biomes + elevation for overworld
        read.push({ x: cx, z: cz, dim: dim, type: 'data2d', key: buffer })
      } else if (otherDim && tagWithDim == Tag.Entity) {
        // enities for dim
        read.push({ x: cx, z: cz, dim: dim, type: 'entity', key: buffer })
      } else if (overworld && tagOver == Tag.Entity) {
        // entities for overworld
        read.push({ x: cx, z: cz, dim: dim, type: 'entity', key: buffer })
      } else if (otherDim && tagWithDim == Tag.BlockEntity) {
        // block entities for dim
        read.push({ x: cx, z: cz, dim: dim, type: 'blockentity', key: buffer })
      } else if (overworld && tagOver == Tag.BlockEntity) {
        // block entities for overworld
        read.push({ x: cx, z: cz, dim: dim, type: 'blockentity', key: buffer })
      } else if (overworld && tagOver == Tag.FinalizedState) {
        // finalized state overworld chunks
        read.push({ x: cx, z: cz, dim: dim, type: 'finalizedState', key: buffer })
      } else if (otherDim && tagWithDim == Tag.FinalizedState) {
        // finalized state for other dimensions
        read.push({ x: cx, z: cz, dim: dim, type: 'finalizedState', key: buffer })
      } else if (overworld && tagWithDim == Tag.VersionOld) {
        // version for pre 1.16.100
        read.push({ x: cx, z: cz, dim: dim, type: 'versionOld', key: buffer })
      } else if (otherDim && tagWithDim == Tag.VersionOld) {
        // version for pre 1.16.100
        read.push({ x: cx, z: cz, dim: dim, type: 'versionOld', key: buffer })
      } else if (otherDim && tagWithDim == Tag.HardCodedSpawnAreas) {
        read.push({ x: cx, z: cz, dim: dim, type: 'spawnarea', key: buffer })
      } else if (overworld && tagWithDim == Tag.HardCodedSpawnAreas) {
        read.push({ x: cx, z: cz, dim: dim, type: 'spawanarea', key: buffer })
      } else if (otherDim && tagWithDim == Tag.BiomeState) {
        read.push({ x: cx, z: cz, dim: dim, type: 'biomeState', key: buffer })
      } else if (overworld && tagOver == Tag.BiomeState) {
        read.push({ x: cx, z: cz, dim: dim, type: 'biomeState', key: buffer })
      }

      if (!read.length) {
        console.log('Failed', cx, cz, tagOver, tagWithDim, dim, overworld, otherDim)
      }
    }
    let skey = String(buffer)
    if (skey.includes('VILLAGE')) {
      if (skey.includes('DWELLERS')) {
        read.push({ type: 'village-dwellers', skey: skey, key: buffer })
      } else if (skey.includes('INFO')) {
        read.push({ type: 'village-info', skey: skey, key: buffer })
      } else if (skey.includes('POI')) {
        read.push({ type: 'village-poi', skey: skey, key: buffer })
      } else if (skey.includes('PLAYERS')) {
        read.push({ type: 'village-players', skey: skey, key: buffer })
      }
    }

    return read
  }

  let db = new LevelDB(path, { createIfMissing: false })
  console.log(`[mc] loaded at ${path}`)
  await db.open()
  let iter = db.getIterator({ values: true })
  let entry = null
  console.log('Iterator entries:')
  while (entry = await iter.next()) {
    // console.log('[mc] readKey: ', entry, entry[0].length)

    let read = readKey(entry[0])
    if (read.length) {
      console.log(JSON.stringify(read))
    } else {
      // console.log('Extranenous: ', entry[1])
    }
  }
  await iter.end()
}

console.log('Test iteration')
testIterate()
for (var i = 0; i < 10; i++) {
  runTest(i, i % 2 == 0).then((i) => {
    if (i == null) return
    try {
      rmdir('./test' + i)
    } catch (e) { console.log(e) }
  })
}
console.log()
testMinecraft(`./mctestdb/`).then(
  () => {
    console.log('Tests are passing! :)')
  }
)
