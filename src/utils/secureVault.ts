const DB_NAME = 'mindcheck-secure-vault';
const DB_VERSION = 1;
const META_STORE = 'vault_meta';
const DATA_STORE = 'encrypted_records';
const DEVICE_KEY = 'vault_device_key';
const STORAGE_EVENT = 'mindcheck-secure-storage-updated';

export const SENSITIVE_KEYS = [
  'mindcheck_history',
  'mindcheck_game_metrics',
  'mindcheck_journal_entries_all',
  'mindcheck_ema_data',
  'mindcheck_ema_history',
  'mindcheck_last_phq9',
  'mindcheck_last_pss',
  'mindcheck_last_rses',
  'mindcheck_last_gad7',
  'mindcheck_last_assessment',
  'mindcheck_hashtag_count',
] as const;

type SensitiveKey = typeof SENSITIVE_KEYS[number];

type EncryptedPayload = {
  iv: string;
  ciphertext: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;
let unlockedKey: CryptoKey | null = null;
let cache: Partial<Record<SensitiveKey, any>> = {};

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function getMeta<T = unknown>(key: string): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(META_STORE, 'readonly');
  const result = await requestToPromise(tx.objectStore(META_STORE).get(key));
  await transactionDone(tx);
  return result as T | undefined;
}

async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(META_STORE, 'readwrite');
  tx.objectStore(META_STORE).put(value, key);
  await transactionDone(tx);
}

async function deleteMeta(key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(META_STORE, 'readwrite');
  tx.objectStore(META_STORE).delete(key);
  await transactionDone(tx);
}

async function getEncryptedRecord(key: SensitiveKey): Promise<EncryptedPayload | undefined> {
  const db = await openDb();
  const tx = db.transaction(DATA_STORE, 'readonly');
  const result = await requestToPromise(tx.objectStore(DATA_STORE).get(key));
  await transactionDone(tx);
  return result as EncryptedPayload | undefined;
}

async function setEncryptedRecord(key: SensitiveKey, value: EncryptedPayload): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(DATA_STORE, 'readwrite');
  tx.objectStore(DATA_STORE).put(value, key);
  await transactionDone(tx);
}

async function deleteEncryptedRecord(key: SensitiveKey): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(DATA_STORE, 'readwrite');
  tx.objectStore(DATA_STORE).delete(key);
  await transactionDone(tx);
}

async function clearEncryptedRecords(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(DATA_STORE, 'readwrite');
  tx.objectStore(DATA_STORE).clear();
  await transactionDone(tx);
}

async function getAllEncryptedRecords(): Promise<Array<[SensitiveKey, EncryptedPayload]>> {
  const db = await openDb();
  const tx = db.transaction(DATA_STORE, 'readonly');
  const store = tx.objectStore(DATA_STORE);
  const keys = await requestToPromise(store.getAllKeys());
  const values = await requestToPromise(store.getAll());
  await transactionDone(tx);
  return keys.map((key, index) => [key as SensitiveKey, values[index] as EncryptedPayload]);
}

async function createDeviceKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportKeyAsJwk(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

async function importKeyFromJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptValue(key: CryptoKey, value: unknown): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoded)
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptValue<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

function notifyStorageChange(key: SensitiveKey | 'all'): void {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

function parseLegacyValue(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function subscribeToSecureVault(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(STORAGE_EVENT, handler);
  return () => window.removeEventListener(STORAGE_EVENT, handler);
}

export async function initializeVault(): Promise<void> {
  let jwk = await getMeta<JsonWebKey>(DEVICE_KEY);
  let key: CryptoKey;
  if (!jwk) {
    key = await createDeviceKey();
    jwk = await exportKeyAsJwk(key);
    await setMeta(DEVICE_KEY, jwk);
  } else {
    key = await importKeyFromJwk(jwk);
  }

  const encryptedRecords = await getAllEncryptedRecords();
  const nextCache: Partial<Record<SensitiveKey, any>> = {};

  await Promise.all(
    encryptedRecords.map(async ([recordKey, payload]) => {
      nextCache[recordKey] = await decryptValue(key, payload);
    })
  );

  unlockedKey = key;
  cache = nextCache;
}

export function lockVault(): void {
  unlockedKey = null;
  cache = {};
}

export function isVaultUnlocked(): boolean {
  return unlockedKey !== null;
}

function ensureUnlocked(): CryptoKey {
  if (!unlockedKey) {
    throw new Error('Secure storage is locked.');
  }
  return unlockedKey;
}

export function getSensitiveValueSync<T>(key: SensitiveKey, fallback: T): T {
  return (cache[key] ?? fallback) as T;
}

export async function setSensitiveValue<T>(key: SensitiveKey, value: T): Promise<void> {
  const cryptoKey = ensureUnlocked();
  cache[key] = value;
  try {
    const encrypted = await encryptValue(cryptoKey, value);
    await setEncryptedRecord(key, encrypted);
  } catch (e) {
    console.error('IDB write failed for', key, e);
    throw e;
  }
  notifyStorageChange(key);
}

export async function removeSensitiveValue(key: SensitiveKey): Promise<void> {
  ensureUnlocked();
  delete cache[key];
  await deleteEncryptedRecord(key);
  notifyStorageChange(key);
}

export async function appendSensitiveArrayValue<T>(key: SensitiveKey, item: T): Promise<T[]> {
  const current = getSensitiveValueSync<T[]>(key, []);
  const next = [...current, item];
  await setSensitiveValue(key, next);
  return next;
}

export async function clearSensitiveData(): Promise<void> {
  ensureUnlocked();
  cache = {};
  await clearEncryptedRecords();
  notifyStorageChange('all');
}

export async function migrateLegacySensitiveData(): Promise<void> {
  ensureUnlocked();

  for (const key of SENSITIVE_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy == null) continue;

    await setSensitiveValue(key, parseLegacyValue(legacy));
    localStorage.removeItem(key);
  }
}

export async function exportSensitiveData(): Promise<Record<SensitiveKey, any>> {
  ensureUnlocked();
  return SENSITIVE_KEYS.reduce((acc, key) => {
    acc[key] = cache[key];
    return acc;
  }, {} as Record<SensitiveKey, any>);
}

export async function resetVault(): Promise<void> {
  await clearSensitiveData();
  lockVault();
}

export async function destroyVault(): Promise<void> {
  lockVault();
  await clearEncryptedRecords();
  await deleteMeta(DEVICE_KEY);
  notifyStorageChange('all');
}
