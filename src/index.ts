import "reflect-metadata";

import { readFile } from "node:fs/promises";
import { dirname } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import koaCors from "@koa/cors";
import Router from "@koa/router";
import { graphql } from "graphql";
import Koa from "koa";
import { koaBody } from "koa-body";
import logger from "koa-logger";
import neo4j from "neo4j-driver";
import { DataSource } from "typeorm";
import { z } from "zod";

import { getUserFromSession } from "./auth/getUserFromSession.js";
import { handlerSignin } from "./auth/signin.js";
import { handlerSignout } from "./auth/signout.js";
import { handlerSignup } from "./auth/signup.js";
import { Context } from "./context.js";
import { entities } from "./db/entities/index.js";
import { resolvers } from "./resolvers/index.js";

const dir = dirname(new URL(import.meta.url).pathname);

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: [`${dir}/db/migrations/*.ts`],
});
await dataSource.initialize();

const neo4jDriver = neo4j.driver(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.NEO4J_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!)
);

const app = new Koa();

app.use(logger());
app.use(koaBody());
app.use(koaCors({ credentials: true }));

const router = new Router();

export const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers({ dataSource, neo4jDriver }),
});

router.post("/auth/signup", handlerSignup({ dataSource }));
router.post("/auth/login", handlerSignin({ dataSource }));
router.post("/auth/logout", handlerSignout());

router.post("/graphql", async (ctx) => {
  // まずは Cookie からセッションを取る、取れなければ Authorization ヘッダーから取る、形式は `Authorization: Bearer session_token`
  // FIXME: 危なそうなので開発環境だけ有効にしたい
  const user = await getUserFromSession({ dataSource })(
    ctx.cookies.get("otmd-session") ?? ctx.get("authorization").split(" ").at(1)
  );
  const { query, variables, operationName } = z
    .object({
      query: z.string(),
      variables: z.record(z.string(), z.any()).nullish(),
      operationName: z.string().nullish(),
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

// ds.destroy() //TODO: when?
