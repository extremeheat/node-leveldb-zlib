## 1.2.1
* [Add GitHub Actions workflow for repo commands](https://github.com/extremeheat/node-leveldb-zlib/commit/2d3f715899b91d2e99a1931ab21480291192c77c) (thanks @extremeheat)
* [Use npm Trusted Publishing for releases](https://github.com/extremeheat/node-leveldb-zlib/commit/a3412e0829de1e1b01a29da55af1f02da2d4a877) (thanks @extremeheat)
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