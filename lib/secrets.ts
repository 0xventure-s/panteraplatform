import "server-only";

import crypto from "crypto";

const VERSION = "v1";

const getEncryptionKey = () => {
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY;

  if (!secret || secret.length < 32) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY debe tener al menos 32 caracteres");
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptSecret = (value: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
};

export const decryptSecret = (value: string) => {
  const [version, ivValue, authTagValue, encryptedValue] = value.split(":");

  if (version !== VERSION || !ivValue || !authTagValue || !encryptedValue) {
    throw new Error("El secreto guardado tiene un formato inválido");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};
