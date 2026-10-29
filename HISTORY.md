## 1.2.1
* [Modernize CI and restore native artifact builds (#14)](https://github.com/extremeheat/node-leveldb-zlib/commit/d6e917b204c70e3f5962046c86ff26a465501db0) (thanks @Copilot)

## 1.2.0
* Add async iterator support for LevelDB and Iterator, use with `for await`

## 1.1.1
* Fix iterators not return all values [#8](https://github.com/extremeheat/node-leveldb-zlib/issues/8), [#9](https://github.com/extremeheat/node-leveldb-zlib/pull/9)

## 1.1.0
* Fix `LevelDB.repair()` and `LevelDB.destory()` methods, and make them static, use as such:
```js
import { LevelDB } from 'leveldb-zlib'
await LeveDB.repair('./db')
```

## 1.0
* All LevelDB APIs now use Promise instead of callbacks
* Improve documentation

## 0.0

Initial release
