// Polyfill for window.storage (claude.ai artifact storage API)
// Uses IndexedDB locally so data persists across sessions

const DB_NAME = "rhizome-storage";
const STORE_NAME = "kv";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE_NAME, mode);
        const store = t.objectStore(STORE_NAME);
        const result = fn(store);
        t.oncomplete = () => resolve(result._result);
        t.onerror = () => reject(t.error);
        if (result instanceof IDBRequest) {
          result._result = undefined;
          result.onsuccess = () => (result._result = result.result);
        }
      })
  );
}

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = await tx("readonly", (store) => store.get(key));
      return value !== undefined ? { value } : null;
    },
    async set(key, value) {
      await tx("readwrite", (store) => store.put(value, key));
    },
    async delete(key) {
      await tx("readwrite", (store) => store.delete(key));
    },
    async list() {
      const keys = await tx("readonly", (store) => store.getAllKeys());
      return keys || [];
    },
  };
}
