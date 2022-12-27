import { GraphQLError } from "graphql";

export const ObjectType = {
  Tag: "tag",
  User: "user",
  Video: "video",
  VideoTag: "videoTag",
  Mylist: "mylist",
  MylistRegistration: "mylistRegistration",
} as const;
export type ObjectType = typeof ObjectType[keyof typeof ObjectType];

export function addIDPrefix(type: ObjectType, id: string): string {
  return [type, id].join(":");
}

export function removeIDPrefix(type: ObjectType, id: string): string {
  const splitted = id.split(":");
  if (splitted.length !== 2) throw new GraphQLError("Invalid ID Format");
  if (splitted[0] !== type) throw new GraphQLError(`Passing Wrong Type ID (expected ${type})`);
  return splitted[1];
}

export type NodeType = "video" | "tag" | "semitag" | "nicovideoVideoSource";
export const buildGqlId = (type: NodeType, dbId: string): string => `${type}:${dbId}`;
export function parseGqlID(type: NodeType, gqlId: string): string | null {
  const separated = gqlId.split(":");
  if (separated.length !== 2) return null;

  const [t, i] = separated;
  if (t !== type) return null;

  return i;
}

export function parseGqlID2(type: NodeType, gqlId: string): string {
  const separated = gqlId.split(":");
  if (separated.length !== 2) throw new GraphQLError(`"${gqlId}" is invalid id for "${type}"`);

  const [t, i] = separated;
  if (t !== type) throw new GraphQLError(`"${gqlId}" is invalid id for "${type}"`);

  return i;
}

export function parseGqlIDs(type: NodeType, gqlIds: string[]): string[] {
  return gqlIds.map((gqlId) => parseGqlID2(type, gqlId));
}

export const GraphQLInvalidIdError = (type: NodeType, invalidId: string) =>
  new GraphQLError(`"${invalidId}" is invalid id for "${type}"`);

export const GraphQLNotFoundError = (type: NodeType, gqlId: string) =>
  new GraphQLError(`No "${type}" found for "${gqlId}"`);
