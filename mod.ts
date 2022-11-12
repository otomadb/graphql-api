import { Application, Router } from "oak/mod.ts";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getVideo } from "./get_video.ts";
import { getTag } from "./get_tag.ts";
import { search } from "./search.ts";

const mc = new MongoClient();
await mc.connect("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
const db = mc.database();

const app = new Application();
const router = new Router();

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

router.get("/tags/:id", async ({ params, response }) => {
  const result = await getTag(db, params.id);

  if (!result.ok) {
    const { status, message } = result.error;
    response.status = status;
    if (message) response.body = message;
    return;
  }

  response.body = result.value;
  return;
});

router.get("/search", async ({ request, response }) => {
  const query = request.url.searchParams.get("query");
  if (!query || query === "") {
    response.status = 400;
    return;
  }

  const result = await search(db, query);

  if (!result.ok) {
    const { status, message } = result.error;
    response.status = status;
    if (message) response.body = message;
    return;
  }

  response.body = result.value;
  return;
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
