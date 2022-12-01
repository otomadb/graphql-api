import koaCORS from "@koa/cors";
import Router from "@koa/router";
import { buildSchema, graphql } from "graphql";
import Koa from "koa";
import { koaBody } from "koa-body";
import { MongoClient } from "mongodb";
import fsPromises from "node:fs/promises";
import { refreshToken, signin, whoami } from "./auth/mod.js";
import { findNiconicoSource } from "./niconico/find.js";
import { getNiconicoSource } from "./niconico/get.js";
import { getTag, registerTag, searchTags } from "./tags/mod.js";
import { getUser } from "./users/mod.js";
import { getVideo, getVideos, registerVideo, searchVideos, tagVideo } from "./videos/mod.js";
import { untagVideo } from "./videos/untag_video.js";

const mongoClient = new MongoClient("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
await mongoClient.connect();

const app = new Koa();

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
  niconicoSource: getNiconicoSource,
  findNiconicoSource: findNiconicoSource,

  // mutation
  signin: signin,
  refreshToken: refreshToken,
  registerTag: registerTag,
  registerVideo: registerVideo,
  tagVideo: tagVideo,
  untagVideo: untagVideo,
};

app.use(koaBody());
app.use(koaCORS({
  credentials: true,
}));

/*
app.use((ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.res.setHeader("Access-Control-Allow-Credentials", "true");
  return next();
});
*/

router.post(
  "/graphql",
  async (ctx, next) => {
    const session = ctx.cookies.get("otmd-session");
    console.log(session);

    if (!session) {
      await next();
      return;
    }

    const [sessionId, secret] = session.split("-");

    if (sessionId && secret === "secret") ctx.state.userId = sessionId;

    await next();
    return;

    /*
    const accessToken = ctx.get("Authorization")?.split("Bearer ")?.[1];

    if (!accessToken) {
      await next();
      return;
    }

    try {
      // const payload = await verifyAccessJWT({ token: accessToken });
      ctx.state.userId = "1";
      // ctx.state.userId = payload?.sub;
    } catch (e) {
      console.error(e);
    } finally {
      await next();
    }
    */
  },
  async (ctx) => {
    const { query, variables, operationName } = ctx.request.body;
    const { userId } = ctx.state;

    ctx.body = await graphql({
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

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(
  { port: 8080 },
  () => console.log("listening now"),
);
