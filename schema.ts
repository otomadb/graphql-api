import { buildSchema } from "graphql";
import { signin } from "./signin.ts";
import { getTag, registerTag, searchTags } from "./tag.ts";
import { getUser, whoami } from "./user.ts";
import { getVideo, registerVideo, searchVideos } from "./video.ts";

export const schema = buildSchema(await Deno.readTextFile(new URL("./sdl.gql", import.meta.url)));

export const rootValue = {
  // query
  video: getVideo,
  tag: getTag,
  searchVideos: searchVideos,
  searchTags: searchTags,
  user: getUser,
  whoami: whoami,

  // mutation
  signin: signin,
  registerTag: registerTag,
  registerVideo: registerVideo,
};
