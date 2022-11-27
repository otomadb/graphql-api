import Router from "@koa/router";
import { buildSchema, graphql } from "graphql";
import Koa from "koa";
import { koaBody } from "koa-body";
import { readFile } from "node:fs/promises";
import "reflect-metadata";
import { z } from "zod";
import { router as authRouter } from "./auth/index.js";
import { getUserFromSession } from "./auth/session.js";
import { whoami } from "./auth_old/whoami.js";
import { dataSource } from "./db/data-source.js";
import { findNiconicoSource } from "./niconico/find.js";
import { getNiconicoSource } from "./niconico/get.js";
import { getTag } from "./tags/get_tag.js";
import { registerTag } from "./tags/register_tag.js";
import { searchTags } from "./tags/search_tags.js";
import { getUser } from "./users/user.js";
import { getVideo } from "./videos/get_video.js";
import { getVideos } from "./videos/get_videos.js";
import { registerVideo } from "./videos/register_video.js";
import { searchVideos } from "./videos/search_videos.js";
import { tagVideo } from "./videos/tag_video.js";
import { untagVideo } from "./videos/untag_video.js";

await dataSource.initialize();

const app = new Koa();

const router = new Router();

export const gqlSchema = buildSchema(await readFile(new URL("../sdl.gql", import.meta.url), { encoding: "utf-8" }));

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
  registerTag: registerTag,
  registerVideo: registerVideo,
  tagVideo: tagVideo,
  untagVideo: untagVideo,
};

app.use(koaBody());

app.use((ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return next();
});

router.use("/auth", authRouter.routes());
router.use("/auth", authRouter.allowedMethods());

router.post("/graphql", async (ctx) => {
  const session = await getUserFromSession(ctx.cookies.get("otmd-session"));
  const { query, variables, operationName } = z
    .object({
      query: z.string(),
      variables: z.optional(z.record(z.string(), z.any())),
      operationName: z.optional(z.string()),
    })
    .parse(ctx.request.body);

  ctx.body = await graphql({
    source: query,
    schema: gqlSchema,
    rootValue: gqlRootValue,
    variableValues: variables,
    operationName: operationName,
    contextValue: {
      session,
    },
  });
  return;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 }, () => console.log("listening now"));
