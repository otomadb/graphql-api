import "reflect-metadata";

import { makeExecutableSchema } from "@graphql-tools/schema";
import Router from "@koa/router";
import { graphql } from "graphql";
import Koa from "koa";
import { koaBody } from "koa-body";
import logger from "koa-logger";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { router as authRouter } from "./auth/index.js";
import { getUserFromSession } from "./auth/session.js";
import { Context } from "./context.js";
import { dataSource } from "./db/data-source.js";
import { resolvers } from "./resolvers/index.js";

await dataSource.initialize();

const app = new Koa();

app.use(logger());
app.use(koaBody());

const router = new Router();

export const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use((ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return next();
});

router.use("/auth", authRouter.routes());
router.use("/auth", authRouter.allowedMethods());

router.post("/graphql", async (ctx) => {
  console.log("!");
  const user = await getUserFromSession(ctx.cookies.get("otmd-session"));
  const { query, variables, operationName } = z
    .object({
      query: z.string(),
      variables: z.optional(z.record(z.string(), z.any())),
      operationName: z.optional(z.string()),
    })
    .parse(ctx.request.body);

  const contextValue: Context = { user };

  ctx.body = await graphql({
    contextValue,
    operationName,
    schema,
    source: query,
    variableValues: variables,
  });

  return;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 }, () => console.log("listening now"));
