import { oakCors } from "cors/mod.ts";
import { graphql } from "graphql";
import { Application, Router } from "oak/mod.ts";
import { schema } from "./schema.ts";

const app = new Application();
const router = new Router();

router.post("/graphql", async ({ request, response }) => {
  const { query, variables, operationName } = await request.body().value;

  const accessToken = request.headers.get("Authorization")?.split("Bearer ")?.[1];

  response.body = await graphql({
    schema: schema,
    source: query,
    variableValues: variables,
    operationName: operationName,
    contextValue: {
      accessToken,
    },
  });
  return;
});

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

router.post("/signin", routeSignin());
router.get("/whoami", guard(), routeWhoAmI(db));
*/

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
