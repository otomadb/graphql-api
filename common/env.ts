import { importSPKI, importPKCS8 } from "jose"

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

function loadPublicKey(input: string) {
  let spki = Buffer.from(input, "base64").toString("ascii")
  return importSPKI(spki, "RS256")
}

function loadPrivateKey(input: string) {
  let pem = Buffer.from(input, "base64").toString("ascii")
  return importPKCS8(pem, "RS256")
}

/* access public */
const accessPubKeyRaw = process.env["ACCESS_TOKEN_PUBLIC_KEY"];
if (!accessPubKeyRaw) {
  console.error(`cannot get "ACCESS_TOKEN_PUBLIC_KEY"`);
  process.exit(1);
}
export const accessPubKey = await loadPublicKey(accessPubKeyRaw)

/* access private */
const accessPrvKeyRaw = process.env["ACCESS_TOKEN_PRIVATE_KEY"];
if (!accessPrvKeyRaw) {
  console.error(`cannot get "ACCESS_TOKEN_PRIVATE_KEY"`);
  process.exit(1);
}
export const accessPrvKey = await loadPrivateKey(accessPrvKeyRaw);

/* refresh public */
const refreshPubKeyRaw = process.env["REFRESH_TOKEN_PUBLIC_KEY"];
if (!refreshPubKeyRaw) {
  console.error(`cannot get "REFRESH_TOKEN_PUBLIC_KEY"`);
  process.exit(1);
}
export const refreshPubKey = await loadPublicKey(refreshPubKeyRaw);

/* refresh private */
const refreshPrvKeyRaw = process.env["REFRESH_TOKEN_PRIVATE_KEY"];
if (!refreshPrvKeyRaw) {
  console.error(`cannot get "REFRESH_TOKEN_PRIVATE_KEY"`);
  process.exit(1);
}
export const refreshPrvKey = await loadPrivateKey(refreshPrvKeyRaw);
