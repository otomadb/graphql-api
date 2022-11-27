const authenticatorProtoPath = new URL("./authenticator.proto", import.meta.url);
export const authenticatorProtoFile = await Deno.readTextFile(authenticatorProtoPath);
