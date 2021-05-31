# node-leveldb-zlib
[![NPM version](https://img.shields.io/npm/v/leveldb-zlib.svg)](http://npmjs.com/package/leveldb-zlib)
[![Build Status](https://github.com/extremeheat/node-leveldb-zlib/workflows/CI/badge.svg)](https://github.com/extremeheat/node-leveldb-zlib/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/extremeheat/node-leveldb-zlib)

LevelDB bindings for Node.js with zlib compression, with a modern promise-based API that actually builds! 🌊

## Install

```sh
npm install leveldb-zlib
```

Prebuilds are provided for 64-bit Windows 10, Linux and macOS Catalina. If a prebuild does not work, please create an issue and set enviornment variable FORCE_BUILD to force a manual build.

## Usage
Some example usage to create a new Key-Value database and save once you're done. The API is very similar to leveldown.

```js
const { LevelDB } = require('leveldb-zlib')

let db = new LevelDB(pathToDb, { createIfMissing: true })
await db.open() // Make sure to wait for DB to open!
await db.put("Key", "Value")
let val = await db.getAsString("Key")
console.assert("Value" == val)
await db.close() // Make sure to save and close when you're done!
```


## Cloning

If cloning from git, you must clone this repo recursively.
```sh
git clone --recursive https://github.com/extremeheat/node-leveldb-zlib
```

## Dependencies

For the most part, pre-builds are provided so you don't need to worry about having the correct build tools installed. But if a pre-build doesn't work, you may need to install the following deps:

Linux:
```sh
sudo apt-get install libz-dev
```

Windows: zlib is packaged inside the repo. You do not need any extra dependencies.

Mac OS: You need to install xcode utilities first (this is *not* the whole Xcode!):

```sh
xcode-select --install
``` 

#### vcpkg

You can also use vcpkg to manage your C++ dependencies. If you don't already have vcpkg installed, install it with the steps at https://github.com/microsoft/vcpkg/#getting-started.

In vcpkg, install zlib: run `vcpkg install zlib`

Then [set environment variable](https://www.onmsft.com/how-to/how-to-set-an-environment-variable-in-windows-10) `DCMAKE_TOOLCHAIN_FILE=[path to vcpkg]/scripts/buildsystems/vcpkg.cmake`.

## API

See [API.md](docs/API.md)
