# volatile-storage

*A volatile storage with a localStorage-like API*

## `class VolatileStorage`

### Constructor

#### `VolatileStorage(props?: object)`

`props.storage?`<br>
An external storage instance with a [localStorage-like API](https://developer.mozilla.org/en-US/docs/Web/API/Storage) (like `window.localStorage` itself, `window.sessionStorage`, or [`localForage`](https://github.com/localForage/localForage#readme)) where all values will actually be stored. Default: in-memory storage.

`props.maxAge?: number`<br>
A storage entry lifetime in milliseconds. Default: `Infinity`. (A stored value may linger on the storage after its lifetime elapses until the next interaction with the storage reveals it has expired and removes it.)

`props.capacity?: number`<br>
A maximum number of entries on the storage. When the number of entries reaches the `capacity` value and a new item is added to the storage, the first added item is removed from the storage to maintain the capacity. Default: `Infinity`.

`props.ns?: string`<br>
A storage entry key namespace. It can be useful to isolate multiple instances of `VolatileStorage` sharing the same external storage (like `window.localStorage`). Default: `''`.

`props.version?: string | number`<br>
A version, or a revision identifier, of the storage. Changing this value will expire values stored in an external storage (like `window.localStorage`) under a different version. Default: `undefined`.

### Methods

The `VolatileStorage` API is an asynchronous version of the [`Storage`](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface.

```js
let storage = new VolatileStorage({
    storage: window.localStorage,
    maxAge: 60000, // 1 minute
    capacity: 100
});

await storage.setItem('x', 1);
let x = await storage.getItem('x');
```

## Installation

```
npm i github:axtk/volatile-storage
```

---

\#browser \#nodejs
