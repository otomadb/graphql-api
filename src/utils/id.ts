import { GraphQLError } from "graphql";

export type NodeType =
  | "user"
  | "video"
  | "tag"
  | "semitag"
  | "nicovideoVideoSource"
  | "mylist"
  | "MylistGroup"
  | "MylistGroupMylistInclusion"
  | "MylistRegistration";

export const buildGqlId = (type: NodeType, dbId: string): string =>
  Buffer.from(`${type}:${dbId}`).toString("base64url");

export function parseGqlID(type: NodeType, gqlId: string): string {
  const split = Buffer.from(gqlId, "base64url").toString().split(":");
  if (split.length !== 2) throw new GraphQLInvalidIDError(type, gqlId);

  const [t, i] = split;
  if (t !== type) throw new GraphQLInvalidIDError(type, gqlId);

  return i;
}

export function parseGqlIDs(type: NodeType, gqlIds: string[]): string[] {
  return gqlIds.map((gqlId) => parseGqlID(type, gqlId));
}

export const GraphQLInvalidIdError = (type: NodeType, invalidId: string) =>
  new GraphQLError(`"${invalidId}" is invalid id for "${type}"`);

export const GraphQLNotFoundError = (type: NodeType, dbId: string) =>
  new GraphQLError(`"${type}" for "${buildGqlId(type, dbId)}" is not found `);

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
