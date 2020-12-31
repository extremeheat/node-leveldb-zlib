# node-leveldb-zlib
LevelDB bindings for Node.js with zlib compression that actually builds!

## Install

`npm install leveldb-zlib@extremeheat/node-leveldb-zlib`

No prebuilds at the moment, you need to have required build dependencies for the install to complete:

## Build
**If cloning from git, you must clone this repo recursively!**

`git clone --recursive https://github.com/extremeheat/node-leveldb-zlib.git`

OR if you already cloned without --recursive, run `git submodules init && git submodules update`

### Build on Linux
```
sudo apt-get install libz-dev
git clone --recursive https://github.com/extremeheat/node-leveldb-zlib.git && cd node-leveldb-zlib
npm install
```
### Build on Windows

If you don't already have vcpkg installed, install it with the steps at https://github.com/microsoft/vcpkg/#getting-started.

In vcpkg, install zlib: run `vcpkg install zlib`

Then set environment variable `DCMAKE_TOOLCHAIN_FILE=[path to vcpkg]/scripts/buildsystems/vcpkg.cmake`

### Build on mac

You need to install xcode utilities first:

```
xcode-select --install
git clone --recursive https://github.com/extremeheat/node-leveldb-zlib.git && cd node-leveldb-zlib
npm install
```

alternatively use the Windows steps above

## Usage


```ts
const { LevelDB } = require('leveldb-zlib')

let db = new LevelDB(pathToDb, { createIfMissing: true })
await db.open()
await db.put("Key", "Value")
let val = await db.getAsString("Key")
console.assert("Value" == val)
```

The keys and values can be either Buffers or Strings: strings will be converted to a buffer automatically.

Full exposed API:
### leveldb.ts
```ts
declare type LevelDBOptions = {
    bufferKeys?: boolean;
    snapshots?: boolean;
    permanence?: true;
    seek?: true;
    clear?: true;
    createIfMissing?: true;
    errorIfExists?: true;
    additionalMethods?: {
        approximateSize?: true;
        compactRange?: true;
    };
};
declare type Operation = {
    type: 'del' | 'put';
    key: Buffer | string;
    value?: Buffer | string;
};
declare type OpOpts = {
    sync?: boolean;
};
declare type IterOpts = {
    reverse?: boolean;
    keys?: boolean;
    values?: boolean;
    fillCache?: boolean;
    keyAsBuffer?: boolean;
    valueAsBuffer?: boolean;
    limit?: number;
    highWaterMark?: boolean;
    end?: any;
    lt?: any;
    lte?: any;
    gt?: any;
    gte?: any;
};

declare class LevelDB  {
    context: any;
    path: string;
    options: LevelDBOptions;
    status: string;
    constructor(path: string, options: LevelDBOptions);
    open(): Promise<unknown>;
    close(): Promise<unknown>;
    static serializeKey(key: any): string | Buffer;
    static serializeValue(value: any): string | Buffer;
    put(key: Buffer | string, value: Buffer | string, options?: OpOpts): Promise<unknown>;
    get(key: Buffer | string, options?: OpOpts): Promise<unknown>;
    getAsString(key: any, options: any): Promise<string>;
    delete(key: Buffer | string, value: Buffer | string, options?: OpOpts): Promise<unknown>;
    chainedBatch(): ChainedBatch;
    batch(operations: Operation[], options?: OpOpts): Promise<unknown>;
    approximateSize(start: any, end: any, callback: any): void;
    compactRange(start: any, end: any, callback: any): void;
    getProperty(property: any): any;
    getIterator(options?: IterOpts): Iterator;
    /**
     * destroy() is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory rm if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.
     * The callback will be called when the destroy operation is complete, with a possible error argument.
     */
    destroy(location: any): Promise<unknown>;
    /**
     * repair() can be used to attempt a restoration of a damaged LevelDB store. From the LevelDB documentation:
     *
     * If a DB cannot be opened, you may attempt to call this method to resurrect as much of the contents of the database as possible. Some data may be lost, so be careful when calling this function on a database that contains important information.
     *
     * You will find information on the repair operation in the LOG file inside the store directory.
     *
     * A repair() can also be used to perform a compaction of the LevelDB log into table files.
     * The callback will be called when the repair operation is complete, with a possible error argument.
     */
    repair(location: string): Promise<unknown>;
}
```

### iterator.ts
```ts
export declare class Iterator {
    context: any;
    cache: any;
    finished: boolean;
    db: any;
    constructor(db: any, options: any);
    seek(target: any): void;
    _next(): Promise<unknown>;
    next(): Promise<any[]>;
    end(): Promise<unknown>;
    static readonly rangeOptions: string[];
    static isRangeOption(k: any): boolean;
    static cleanRangeOptions(options: any): {};
    static _setupIteratorOptions(options?: any): void;
}
```
