import { oakCors } from "cors/mod.ts";
import { graphql } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { routeSignin } from "./auth/signin.ts";
import { rootValue, schema } from "./graphql/schema.ts";
import { verifyAccessJWT } from "./jwt.ts";

const mongoClient = new MongoClient();
await mongoClient.connect("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");

const app = new Application();
const router = new Router();

router.post(
  "/graphql",
  async ({ state, request }, next) => {
    const accessToken = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    if (!accessToken) {
      await next();
      return;
    }

    const ls = await verifyAccessJWT({ token: accessToken }) as any;
    console.dir(ls.sub);
    state.userId = ls.sub;

    await next();
    return;
  },
  async ({ state, request, response }) => {
    const { query, variables, operationName } = await request.body().value;
    const { userId } = state;

    response.body = await graphql({
      source: query,
      schema: schema,
      rootValue: rootValue,
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

/*
router.get("/videos/:id", async ({ params, response }) => {
  const result = await getVideo(db, params.id);

  if (!result.ok) {
    const { status, message } = result.error;
    response.status = status;
    if (message) response.body = message;
    return;
  }

  response.body = result.value;
  return;
});

router.get("/tags/:id", routeGetTag(db));
router.get("/search", routeSearch(db));

router.get("/niconico/check/:id", async ({ params, response }) => {
  const result = await checkNiconicoVideo(params.id);
  if (!result.ok) {
    const { status, message } = result.error;
    response.status = status;
    if (message) response.body = message;
    return;
  }
  response.body = result.value;
  return;
});

router.post("/tags/add", async ({ params, request, response }) => {
  const payload = await request.body({ type: "json" }).value;

  const result = await addTag(db, payload);
  if (!result.ok) {
    const { status, message } = result.error;
    response.status = status;
    if (message) response.body = message;
    return;
  }

  response.body = result.value;
});

router.get("/whoami", guard(), routeWhoAmI(db));
*/

router.post("/signin", routeSignin());

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
