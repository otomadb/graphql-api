import "reflect-metadata";

import { readFile } from "node:fs/promises";

import koaCors from "@koa/cors";
import Router from "@koa/router";
import { createSchema, createYoga } from "graphql-yoga";
import Koa from "koa";
import { koaBody } from "koa-body";
import logger from "koa-logger";

import { router as authRouter } from "./auth/index.js";
import { getUserFromSession } from "./auth/session.js";
import { Context } from "./context.js";
import { dataSource } from "./db/data-source.js";
import { resolvers } from "./resolvers/index.js";

await dataSource.initialize();

const app = new Koa();

app.use(logger());
const koaBodyMiddleware = koaBody();
app.use(koaCors({ credentials: true }));

const router = new Router();

export const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });

const schema = createSchema<Context>({ typeDefs, resolvers });
const yoga = createYoga<Context>({ schema })

router.use("/auth", koaBodyMiddleware, authRouter.routes(), authRouter.allowedMethods());

router.post("/graphql", async (ctx) => {
  // まずは Cookie からセッションを取る、取れなければ Authorization ヘッダーから取る、形式は `Authorization: Bearer session_token`
  // FIXME: 危なそうなので開発環境だけ有効にしたい
  const user = await getUserFromSession(ctx.cookies.get("otmd-session") ?? ctx.get("authorization").split(" ").at(1));
  const contextValue: Context = { user };

  const response = await yoga.handleNodeRequest(ctx.req, contextValue);

  ctx.status = response.status
  for (const [key, val] of response.headers) {
    ctx.set(key, val)
  }
  ctx.body = response.body

  return;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 }, () => console.log("listening now"));
