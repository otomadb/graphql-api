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

type NodeType = "video" | "tag" | "semitag" | "nicovideoVideoSource";
export const buildGqlId = (type: NodeType, dbId: string): string => `${type}:${dbId}`;
export function parseGqlID(type: NodeType, gqlId: string): string | null {
  const separated = gqlId.split(":");
  if (separated.length !== 2) return null;

  const [t, i] = separated;
  if (t !== type) return null;

  return i;
}
export const buildInvalidGqlIdError = (type: NodeType, id: string) =>
  new GraphQLError(`"${id}" is invalid id for "${type}"`);

export function parseGqlIDs(type: NodeType, gqlIds: string[]): string[] {
  const ids = [];
  for (const exceptGqlId of gqlIds) {
    const exceptId = parseGqlID(type, exceptGqlId);
    if (!exceptId) throw buildInvalidGqlIdError(type, exceptGqlId);
    ids.push(exceptId);
  }
  return ids;
}
