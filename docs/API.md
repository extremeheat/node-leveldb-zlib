Most of the API is very similar to leveldown, you can refer to the docs [here](https://github.com/Level/leveldown#db--leveldownlocation). The primary differences are that instead of callbacks, all the exposed API uses promises, and to acquire an iterator, use db.getIterator().

The primary API interface is the LevelDB class. It takes a path and optional options parameter. The default option is to not create a database if it doesn't exist.

The keys and values can be either Buffers or Strings: strings will be converted to a buffer automatically.

```js
  const db = new LevelDB(pathToDb, { createIfMissing: true })
  await db.open() // Make sure to wait for DB to open!
  await db.put('Hello', 'World')
  const iter = db.getIterator({ values: true, keys: true }) // Both `keys` and `values` default to true
  let entry
  while (entry = await iter.next()) {
    const [ val, key ] = entry.map(k => String(k))
    console.log('Read', key, val)
  }
  await db.close() // Make sure to save and close when you're done!  
```

See [example.js](./example.js) for an simple example program.

The types exported in this library are below.

#### LevelDB

```ts
export declare class LevelDB {
    context: any;
    path: string;
    options: LevelDBOptions;
    status: string;
    constructor(path: string, options?: LevelDBOptions);
    /**
     * Opens the database.
     * @returns {Promise} Resolves when the database has been opened.
     */
    open(): Promise<unknown>;
    isOpen(): boolean;
    /**
     * Closes the database.
     * @returns {Promise} Resolves when the database has been opened.
     */
    close(): Promise<unknown>;
    static serializeKey(key: any): string | Buffer;
    static serializeValue(value: any): string | Buffer;
    put(key: Buffer | string, value: Buffer | string, options?: OpOpts): Promise<boolean>;
    get(key: Buffer | string, options?: OpOpts): Promise<Buffer | null>;
    getAsString(key: Buffer | string, options?: OpOpts): Promise<string>;
    delete(key: Buffer | string, options?: OpOpts): Promise<boolean>;
    chainedBatch(): ChainedBatch;
    batch(operations: Operation[], options?: OpOpts): Promise<boolean>;
    approximateSize(start: any, end: any): Promise<unknown>;
    compactRange(start: any, end: any): Promise<unknown>;
    getProperty(property: any): any;
    /**
     * Creates a new iterator with the specified options.
     * @param options Iterator options
     * @returns {Iterator}
     */
    getIterator(options?: IterOpts): Iterator;
    /**
     * Delete all entries or a range.
     */
    clear(options: ClearOpts): Promise<unknown>;
    /**
     * destroy() is used to completely remove an existing LevelDB database directory. You can use this function in place of a full directory rm if you want to be sure to only remove LevelDB-related files. If the directory only contains LevelDB files, the directory itself will be removed as well. If there are additional, non-LevelDB files in the directory, those files, and the directory, will be left alone.
     * The callback will be called when the destroy operation is complete, with a possible error argument.
     */
    static destroy(location: any): Promise<unknown>;
    /**
     * repair() can be used to attempt a restoration of a damaged LevelDB store. From the LevelDB documentation:
     *
     * If a DB cannot be opened, you may attempt to call this method to resurrect as much of the contents of the database as possible. Some data may be lost, so be careful when calling this function on a database that contains important information.
     *
     * You will find information on the repair operation in the LOG file inside the store directory.
     *
     * A repair() can also be used to perform a compaction of the LevelDB log into table files.
     */
    static repair(location: string): Promise<unknown>;
}
```

#### Iterator

````ts
export declare class Iterator {
    constructor(db: any, options: {
      reverse = false
      keys = true
      values = true
      limit?
      keyAsBuffer?
      valueAsBuffer?
    });
    /**
     * Seek to a position
     * @param target Key to seek to. Empty string for start or end if reversed.
     */
    seek(target: any): void;
    next(): Promise<any>;
    end(): Promise<unknown>;
}
````