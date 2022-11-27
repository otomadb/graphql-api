import Router from "@koa/router";
import Koa from "koa";
import { koaBody } from "koa-body";
import "reflect-metadata";
import { router as authRouter } from "./auth/index.js";
import { dataSource } from "./db/data-source.js";

await dataSource.initialize();

const app = new Koa();

const router = new Router();

/*
export const gqlSchema = buildSchema(
  await fsPromises.readFile(new URL("./sdl.gql", import.meta.url), { encoding: "utf-8" })
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
*/

app.use(koaBody());

app.use((ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return next();
});

router.use("/auth", authRouter.routes());
router.use("/auth", authRouter.allowedMethods());

/*
router.post(
  "/graphql",
  async (ctx, next) => {
    const accessToken = ctx.get("Authorization")?.split("Bearer ")?.[1];

    if (!accessToken) {
      await next();
      return;
    }

    try {
      const payload = await verifyAccessJWT({ token: accessToken });
      ctx.state.userId = payload?.sub;
    } catch (e) {
      console.error(e);
    } finally {
      await next();
    }
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
  }
);
*/

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 }, () => console.log("listening now"));
