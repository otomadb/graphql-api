import { GraphQLError } from "graphql";

import { Result } from "../utils/Result.js";

export type NodeType =
  | "User"
  | "Video"
  | "Tag"
  | "Semitag"
  | "NicovideoVideoSource"
  | "Mylist"
  | "MylistGroup"
  | "MylistGroupMylistInclusion"
  | "MylistRegistration"
  | "VideoEvent"
  | "Session";

export const buildGqlId = (type: NodeType, dbId: string): string =>
  Buffer.from(`${type}:${dbId}`).toString("base64url");

export function parseGqlID(type: NodeType, gqlId: string): string {
  const split = Buffer.from(gqlId, "base64url").toString().split(":");
  if (split.length !== 2) throw new GraphQLInvalidIDError(type, gqlId);

  const [t, i] = split;
  if (t !== type) throw new GraphQLInvalidIDError(type, gqlId);

  return i;
}

export function parseGqlID2(type: NodeType, gqlId: string): Result<"INVALID_ID", string> {
  const split = Buffer.from(gqlId, "base64url").toString().split(":");
  if (split.length !== 2) return { status: "error", error: "INVALID_ID" };

  const [t, i] = split;
  if (t !== type) return { status: "error", error: "INVALID_ID" };

  return { status: "ok", data: i };
}

export function parseGqlIDs(type: NodeType, gqlIds: string[]): string[] {
  return gqlIds.map((gqlId) => parseGqlID(type, gqlId));
}

export class GraphQLInvalidIDError extends GraphQLError {
  constructor(type: NodeType, invalidId: string) {
    super(`"${invalidId}" is invalid id for "${type}"`);
  }
}

export class GraphQLNotExistsInDBError extends GraphQLError {
  constructor(type: NodeType, dbId: string) {
    super(`"${type}" for "${buildGqlId(type, dbId)}" is not found `);
  }
}
