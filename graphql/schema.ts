import { buildSchema } from "graphql";
import { getTag, searchTags } from "./tag.ts";
import { getVideo, searchVideos } from "./video.ts";

export const schema = buildSchema(await Deno.readTextFile(new URL("./sdl.gql", import.meta.url)));

export const rootValue = {
  video: getVideo,
  tag: getTag,
  searchVideos: searchVideos,
  searchTags: searchTags,
};
