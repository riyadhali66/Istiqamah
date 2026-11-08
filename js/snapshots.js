// Daily copies and replacement checkpoints are separate so a restore never erases its undo copy.
let connection;
function open() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open("istiqamah-safety", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("daily", { keyPath: "date" });
        request.result.createObjectStore("checkpoints", {
          keyPath: "id",
          autoIncrement: true,
        });
        request.result.createObjectStore("optional", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        connection = null;
        reject(request.error);
      };
      request.onblocked = () => {
        connection = null;
        reject(new Error("Backup database is blocked"));
      };
    });
  return connection;
}
export async function transact(name, mode, operation) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(name, mode),
      store = transaction.objectStore(name);
    let result;
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = transaction.onabort = () =>
      reject(transaction.error || new Error("Backup failed"));
    operation(store, (value) => {
      result = value;
    });
  });
}
export const snapshots = {
  async put(date, data) {
    await transact("daily", "readwrite", (store) => {
      store.put({ date, data, savedAt: new Date().toISOString() });
      const request = store.getAllKeys();
      request.onsuccess = () =>
        request.result
          .sort()
          .slice(0, -7)
          .forEach((key) => store.delete(key));
    });
  },
  list() {
    return transact("daily", "readonly", (store, done) => {
      store.getAll().onsuccess = (event) =>
        done(event.target.result.sort((a, b) => b.date.localeCompare(a.date)));
    });
  },
  checkpoint(data, reason) {
    return transact("checkpoints", "readwrite", (store) => {
      store.add({ data, reason, savedAt: new Date().toISOString() });
      store.getAllKeys().onsuccess = (event) =>
        event.target.result.slice(0, -7).forEach((key) => store.delete(key));
    });
  },
  checkpoints() {
    return transact("checkpoints", "readonly", (store, done) => {
      store.getAll().onsuccess = (event) => done(event.target.result.reverse());
    });
  },
};
