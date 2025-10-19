// IndexedDB utility for offline event caching
const DB_NAME = 'calendarApp';
const DB_VERSION = 1;
const STORE_NAME = 'events';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('startDateTime', 'startDateTime', { unique: false });
      }
    };
  });
};

export const cacheEvents = async (events, startDate, endDate) => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);

  // Clean up old events (older than 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const index = objectStore.index('startDateTime');
  const range = IDBKeyRange.upperBound(sevenDaysAgo.toISOString());
  const cursorRequest = index.openCursor(range);
  
  cursorRequest.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  // Cache new events
  events.forEach((event) => {
    const cacheEntry = {
      ...event,
      id: event.id,
      startDateTime: event.startDateTime instanceof Date 
        ? event.startDateTime.toISOString() 
        : event.startDateTime,
      endDateTime: event.endDateTime instanceof Date 
        ? event.endDateTime.toISOString() 
        : event.endDateTime,
      cachedAt: new Date().toISOString(),
    };
    objectStore.put(cacheEntry);
  });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getCachedEvents = async (startDate, endDate) => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(STORE_NAME);
  const index = objectStore.index('startDateTime');

  const range = IDBKeyRange.bound(
    startDate.toISOString(),
    endDate.toISOString()
  );

  return new Promise((resolve, reject) => {
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearCache = async () => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = objectStore.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
