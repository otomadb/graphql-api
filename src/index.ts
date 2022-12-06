import "reflect-metadata";

import koaCors from "@koa/cors";
import Router from "@koa/router";
import { createSchema, createYoga } from "graphql-yoga";
import Koa from "koa";
import { koaBody } from "koa-body";
import KoaLogger from "koa-logger";
import { readFile } from "node:fs/promises";
import { router as authRouter } from "./auth/index.js";
import { getUserFromSession } from "./auth/session.js";
import { dataSource } from "./db/data-source.js";
import { resolvers } from "./resolvers/index.js";

await dataSource.initialize();

const typeDefs = await readFile(new URL("../schema.gql", import.meta.url), { encoding: "utf-8" });
const schema = createSchema<Koa.ParameterizedContext>({ typeDefs, resolvers: resolvers });
const yoga = createYoga<Koa.ParameterizedContext>({
  schema,
  async context(ctx) {
    console.dir(ctx.get("authorization"));
    // const user = await getUserFromSession(ctx.cookies.get("otmd-session") ?? ctx.get("authorization").split(" ").at(1));
    return {};
    // return { user };
  },
});

const app = new Koa();

const router = new Router();
router.use(koaBody());
router.use("/auth", authRouter.routes());
router.use("/auth", authRouter.allowedMethods());

app.use(KoaLogger());
app.use(koaCors({ credentials: true }));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (ctx) => {
  console.dir(ctx.get("authorization"));
  const response = await yoga.handleNodeRequest(ctx.req, ctx);

  ctx.status = response.status;
  response.headers.forEach((value, key) => {
    ctx.append(key, value);
  });
  ctx.body = response.body;
});

app.listen({ port: 4000 }, () => console.log("listening now"));

/*
router.post("/graphql", async (ctx) => {
  // まずは Cookie からセッションを取る、取れなければ Authorization ヘッダーから取る、形式は `Authorization: Bearer session_token`
  // FIXME: 危なそうなので開発環境だけ有効にしたい
  const user = await getUserFromSession(ctx.cookies.get("otmd-session") ?? ctx.get("authorization").split(" ").at(1));
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
*/

/*
 */
