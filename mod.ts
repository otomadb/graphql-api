import { oakCors } from "cors/mod.ts";
import { MongoClient } from "mongo/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { addTag } from "./add_tag.ts";
import { guard, routeSignin, routeWhoAmI } from "./auth/mod.ts";
import { checkNiconicoVideo } from "./check_niconico_video.ts";
import { routeGetTag } from "./get_tag.ts";
import { getVideo } from "./get_video.ts";
import { routeSearch } from "./search.ts";

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

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
