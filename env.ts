import { crypto } from "std/crypto/mod.ts";

function removeLines(str: string) {
  return str.replace("\n", "");
}

function base64ToArrayBuffer(b64: string) {
  const byteString = atob(b64);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return byteArray;
}

function pemToArrayBuffer(pemKey: string, type: "PUBLIC" | "PRIVATE") {
  const b64Lines = removeLines(pemKey);
  const b64Prefix = b64Lines.replace(`-----BEGIN ${type} KEY-----`, "");
  const b64Final = b64Prefix.replace(`-----END ${type} KEY-----`, "");

  return base64ToArrayBuffer(b64Final);
}

function convertToCryptoKey({ pemKey, type }: { pemKey: string; type: "PUBLIC" | "PRIVATE" }) {
  if (type === "PRIVATE") {
    return crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(pemKey, type),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" },
      },
      false,
      ["sign"],
    );
  } else if (type === "PUBLIC") {
    return crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(pemKey, type),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" },
      },
      false,
      ["verify"],
    );
  }
}

/* access public */
const accessPubKeyRaw = Deno.env.get("ACCESS_TOKEN_PUBLIC_KEY");
if (!accessPubKeyRaw) {
  console.error(`cannot get "ACCESS_TOKEN_PUBLIC_KEY"`);
  Deno.exit(1);
}
export const accessPubKey = await convertToCryptoKey({ pemKey: atob(accessPubKeyRaw), type: "PUBLIC" });

/* access private */
const accessPrvKeyRaw = Deno.env.get("ACCESS_TOKEN_PRIVATE_KEY");
if (!accessPrvKeyRaw) {
  console.error(`cannot get "ACCESS_TOKEN_PRIVATE_KEY"`);
  Deno.exit(1);
}
export const accessPrvKey = await convertToCryptoKey({ pemKey: atob(accessPrvKeyRaw), type: "PRIVATE" });

/* refresh public */
const refreshPubKeyRaw = Deno.env.get("REFRESH_TOKEN_PUBLIC_KEY");
if (!refreshPubKeyRaw) {
  console.error(`cannot get "REFRESH_TOKEN_PUBLIC_KEY"`);
  Deno.exit(1);
}
export const refreshPubKey = await convertToCryptoKey({ pemKey: atob(refreshPubKeyRaw), type: "PUBLIC" });

/* refresh private */
const refreshPrvKeyRaw = Deno.env.get("REFRESH_TOKEN_PRIVATE_KEY");
if (!refreshPrvKeyRaw) {
  console.error(`cannot get "REFRESH_TOKEN_PRIVATE_KEY"`);
  Deno.exit(1);
}
export const refreshPrvKey = await convertToCryptoKey({ pemKey: atob(refreshPrvKeyRaw), type: "PRIVATE" });
