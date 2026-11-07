// Versioned, authenticated envelope. These fixed parameters are checked before expensive work.
const FORMAT = "istiqamah.encrypted-backup",
  ITERATIONS = 310000;
const encoder = new TextEncoder(),
  decoder = new TextDecoder("utf-8", { fatal: true });
function encode(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}
function decode(value) {
  if (
    typeof value !== "string" ||
    value.length > 15 * 1024 * 1024 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value)
  )
    throw new Error("Invalid encrypted backup");
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}
async function derive(passphrase, salt) {
  if (!globalThis.crypto?.subtle)
    throw new Error("Encryption requires HTTPS or localhost");
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
const aad = encoder.encode(FORMAT + ":1");
export function isEncrypted(value) {
  return value?.format === FORMAT;
}
export async function encryptBackup(data, passphrase) {
  if (typeof passphrase !== "string" || passphrase.length < 12)
    throw new Error("Use at least 12 characters");
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    encoder.encode(JSON.stringify(data)),
  );
  return {
    format: FORMAT,
    version: 1,
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    cipher: "AES-256-GCM",
    salt: encode(salt),
    iv: encode(iv),
    ciphertext: encode(new Uint8Array(encrypted)),
  };
}
export async function decryptBackup(envelope, passphrase) {
  if (
    !isEncrypted(envelope) ||
    envelope.version !== 1 ||
    envelope.iterations !== ITERATIONS ||
    envelope.kdf !== "PBKDF2-SHA256" ||
    envelope.cipher !== "AES-256-GCM"
  )
    throw new Error("Unsupported encrypted backup");
  const salt = decode(envelope.salt),
    iv = decode(envelope.iv),
    ciphertext = decode(envelope.ciphertext);
  if (
    salt.length !== 16 ||
    iv.length !== 12 ||
    ciphertext.length < 16 ||
    ciphertext.length > 10 * 1024 * 1024
  )
    throw new Error("Invalid encrypted backup");
  const key = await derive(passphrase, salt);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    ciphertext,
  );
  return JSON.parse(decoder.decode(plain));
}
