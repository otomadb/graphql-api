// import { oakCors } from "cors/mod.js";
import { Application, Router } from "@oakserver/oak";
import { buildSchema, graphql } from "graphql";
import { MongoClient } from "mongodb";
import fsPromises from "node:fs/promises";
import { verifyAccessJWT } from "./auth/jwt.js";
import { refreshToken, signin, whoami } from "./auth/mod.js";
import { getTag, registerTag, searchTags } from "./tags/mod.js";
import { getUser } from "./users/mod.js";
import { getVideo, getVideos, registerVideo, searchVideos, tagVideo } from "./videos/mod.js";
import { untagVideo } from "./videos/untag_video.js";

const mongoClient = new MongoClient("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
await mongoClient.connect();

const app = new Application();

const router = new Router();

export const gqlSchema = buildSchema(
  await fsPromises.readFile(new URL("./sdl.gql", import.meta.url), { encoding: "utf-8" }),
);
export const gqlRootValue = {
  // query
  video: getVideo,
  videos: getVideos,
  tag: getTag,
  searchVideos: searchVideos,
  searchTags: searchTags,
  user: getUser,
  whoami: whoami,

  // mutation
  signin: signin,
  refreshToken: refreshToken,
  registerTag: registerTag,
  registerVideo: registerVideo,
  tagVideo: tagVideo,
  untagVideo: untagVideo,
};

app.use((context, next) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*")
  context.response.headers.set("Access-Control-Allow-Methods", "GET, POST")
  context.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return next()
})

router.post(
  "/graphql",
  async ({ state, request }, next) => {
    const accessToken = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    if (!accessToken) {
      await next();
      return;
    }

    try {
      const payload = await verifyAccessJWT({ token: accessToken });
      state.userId = payload?.sub;
    } catch (e) {
      console.error(e);
    } finally {
      await next();
    }
  },
  async ({ state, request, response }) => {
    const { query, variables, operationName } = await request.body().value;
    const { userId } = state;

    response.body = await graphql({
      source: query,
      schema: gqlSchema,
      rootValue: gqlRootValue,
      variableValues: variables,
      operationName: operationName,
      contextValue: {
        userId,
        mongo: mongoClient,
      },
    });
    return;
  },
);

// app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
