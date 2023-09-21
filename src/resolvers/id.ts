import { GraphQLError } from "graphql";

import { err, isErr, ok, Result } from "../utils/Result.js";

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
  | "Notification"
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
  | "VideoTitleEvent"
  | "YoutubeVideoSource"
  | "YoutubeVideoSourceEvent"
  | "YoutubeRegistrationRequestTagging"
  | "YoutubeRegistrationRequestSemitagging"
  | "YoutubeRegistrationRequest"
  | "SoundcloudVideoSource"
  | "SoundcloudVideoSourceEvent";

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
  if (split.length !== 2) return err("INVALID_ID");

  const [t, i] = split;
  if (t !== type) return err("INVALID_ID");

  return ok(i);
}

export function parseGqlID3(type: NodeType, gqlId: string): Result<{ type: "INVALID_ID"; invalidId: string }, string> {
  const split = Buffer.from(gqlId, "base64url").toString().split(":");
  if (split.length !== 2) return err({ type: "INVALID_ID", invalidId: gqlId });

  const [t, i] = split;
  if (t !== type) return err({ type: "INVALID_ID", invalidId: gqlId });

  return ok(i);
}

export function parseGqlIDs3(
  type: NodeType,
  gqlIds: string[],
): Result<{ type: "INVALID_ID"; invalidId: string } | { type: "DUPLICATED"; duplicatedId: string }, string[]> {
  const ids: string[] = [];
  for (const gqlId of gqlIds) {
    const id = parseGqlID3(type, gqlId);
    if (isErr(id)) return id;
    if (ids.includes(id.data)) return err({ type: "DUPLICATED", duplicatedId: gqlId });
    ids.push(id.data);
  }
  return ok(ids);
}

/**
 * 重複チェックは無視する
 */
export function parseGqlIDs3SkipDupl(
  type: NodeType,
  gqlIds: string[],
): Result<{ type: "INVALID_ID"; invalidId: string }, string[]> {
  const ids: string[] = [];
  for (const gqlId of gqlIds) {
    const id = parseGqlID3(type, gqlId);
    if (isErr(id)) return id;
    ids.push(id.data);
  }
  return ok(ids);
}

export function parseGqlIDs2(
  type: NodeType,
  gqlIds: string[],
): Result<{ type: "INVALID_ID"; wrongGqlIds: string[] }, string[]> {
  const ids: string[] = [],
    wrongGqlIds: string[] = [];
  for (const gqlId of gqlIds) {
    const p = parseGqlID2(type, gqlId);
    if (isErr(p)) wrongGqlIds.push(gqlId);
    else ids.push(p.data);
  }
  if (0 < wrongGqlIds.length) return err({ type: "INVALID_ID", wrongGqlIds });
  return ok(ids);
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
