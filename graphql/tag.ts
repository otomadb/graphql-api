import { GraphQLEnumType, GraphQLError, GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { GraphQLNonNullBoolean, GraphQLNonNullId, GraphQLNonNullString } from "./common.ts";
import { VideoType } from "./video.ts";

export const TagNameType = new GraphQLObjectType<{ name: string; primary?: boolean }>({
  name: "TagName",
  fields: {
    name: { type: GraphQLNonNullString },
    primary: {
      type: GraphQLNonNullBoolean,
      resolve({ primary }): boolean {
        return !!primary;
      },
    },
  },
});

export const TagTypeEnumType = new GraphQLEnumType({
  name: "TagType",
  values: {
    "COPYRIGHT": {
      value: "COPYRIGHT",
    },
    "MATERIAL": {
      value: "MATERIAL",
    },
    "MUSIC": {
      value: "MUSIC",
    },
    "SERIES": {
      value: "SERIES",
    },
    "IMAGE": {
      value: "IMAGE",
    },
    "TACTICS": {
      value: "TACTICS",
    },
    "CLASS": {
      value: "CLASS",
    },
    "EVENT": {
      value: "EVENT",
    },
  },
});

export const TagType = new GraphQLObjectType<{
  id: string;
  type: string;
  names: { name: string; primary?: boolean }[];
}>({
  name: "Tag",
  fields: () => ({
    id: { type: GraphQLNonNullId },
    type: {
      type: new GraphQLNonNull(TagTypeEnumType),
    },
    name: {
      type: GraphQLNonNullString,
      resolve({ names }) {
        const name = names.find(({ primary }) => primary);
        if (!name) {
          throw new GraphQLError("no primary name");
        }
        return name.name;
      },
    },
    names: {
      type: new GraphQLNonNull(new GraphQLList(TagNameType)),
    },
    taggedVideos: {
      type: new GraphQLNonNull(new GraphQLList(VideoType)),
    },
  }),
});
