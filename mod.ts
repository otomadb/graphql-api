import { Application, Router } from "oak/mod.ts";
import videos from "./data/videos.json" assert { type: "json" };

const app = new Application();
const router = new Router();

router.get("/videos/:id", ({ params, request, response }) => {
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
