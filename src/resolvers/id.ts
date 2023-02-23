import { GraphQLError } from "graphql";

import { Result } from "../utils/Result.js";

export type NodeType =
  | "Mylist"
  | "MylistGroup"
  | "MylistGroupMylistInclusion"
  | "MylistRegistration"
  | "NicovideoRegistrationRequest"
  | "NicovideoRegistrationRequestSemitagging"
  | "NicovideoRegistrationRequestTagging"
  | "NicovideoVideoSource"
  | "NicovideoVideoSourceEvent"
  | "Semitag"
  | "SemitagEvent"
  | "Session"
  | "Tag"
  | "TagEvent"
  | "TagEventName"
  | "TagName"
  | "TagParent"
  | "TagParentEvent"
  | "User"
  | "Video"
  | "VideoEvent"
  | "VideoTag"
  | "VideoTagEvent"
  | "VideoThumbnail"
  | "VideoThumbnailEvent"
  | "VideoTitle"
  | "VideoTitleEvent";

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

export function parseGqlIDs2(
  type: NodeType,
  gqlIds: string[]
): Result<{ type: "INVALID_ID"; wrongGqlIds: string[] }, string[]> {
  const ids: string[] = [],
    wrongGqlIds: string[] = [];
  for (const gqlId of gqlIds) {
    const p = parseGqlID2(type, gqlId);
    if (p.status === "error") wrongGqlIds.push(gqlId);
    else ids.push(p.data);
  }
  if (0 < wrongGqlIds.length)
    return {
      status: "error",
      error: { type: "INVALID_ID", wrongGqlIds },
    };
  return { status: "ok", data: ids };
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
