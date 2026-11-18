import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Provider API keys are stored in Supabase as AES-256-GCM ciphertext in the
// format  base64(iv).base64(authTag).base64(ciphertext)  — produced by the
// dashboard's server code with KEY_ENCRYPTION_SECRET. The runner decrypts
// with the same secret, which lives only in the reporter's own config.
export function decryptKey(ciphertext, secret) {
  if (!ciphertext) return "";
  const key = Buffer.from(secret, "hex");
  if (key.length !== 32) {
    throw new Error("keyEncryptionSecret must be 64 hex characters (32 bytes)");
  }
  const [ivB64, tagB64, dataB64] = String(ciphertext).split(".");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function encryptKey(plaintext, secret, iv) {
  // Used by tests to round-trip; production encryption happens server-side.
  const key = Buffer.from(secret, "hex");
  const useIv = iv || randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, useIv);
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [useIv.toString("base64"), tag.toString("base64"), data.toString("base64")].join(".");
}
