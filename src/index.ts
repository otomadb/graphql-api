import "reflect-metadata";

import { readFile } from "node:fs/promises";

import koaCors from "@koa/cors";
import Router from "@koa/router";
import { createSchema, createYoga } from "graphql-yoga";
import Koa from "koa";
import { koaBody } from "koa-body";
import logger from "koa-logger";

import { handlerSignin } from "./auth/handler_signin.js";
import { handlerSignup } from "./auth/handler_signup.js";
import { getUserFromSession } from "./auth/session.js";
import { Context } from "./context.js";
import { dataSource } from "./db/data-source.js";
import { resolvers } from "./resolvers/index.js";

await dataSource.initialize();

const app = new Koa();
app.use(logger());
app.use(koaCors({ credentials: true }));

const router = new Router();
router.use(koaBody());
// そのうち消す
router.post("/auth/signup", handlerSignup);
router.post("/auth/login", handlerSignin);

router.post("/signup", handlerSignup);
router.post("/signin", handlerSignin);

app.use(router.routes());
app.use(router.allowedMethods());

const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });
const schema = createSchema<Context>({ typeDefs, resolvers });
const yoga = createYoga<Context>({
  schema,
  /*
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  }, // TODO: 何？
  */
});

app.use(async (ctx) => {
  const sessionToken = ctx.cookies.get("otmd-session") ?? ctx.headers["authorization"]?.split(" ").at(1);
  const user = sessionToken ? await getUserFromSession(sessionToken) : null;

  const response = await yoga.handleNodeRequest(ctx.req, { user });

  ctx.status = response.status;
  response.headers.forEach((value: string, key: string) => {
    ctx.append(key, value);
  });
  ctx.body = response.body;
});

app.listen({ port: 4000 }, () => console.log("listening now"));
