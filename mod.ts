import { Application, Router } from "oak/mod.ts";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getVideo } from "./get_video.ts";
import { getTag } from "./get_tag.ts";

const mc = new MongoClient();
await mc.connect("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
const db = mc.database();

const app = new Application();
const router = new Router();

/*
router.get("/videos", ({ params, request, response }) => {
});
*/

/**
 *  {
    "id": "1",
    "title_primary": "これで私は所持金が底をついたので：草",
    "image_primary": "https://nicovideo.cdn.nimg.jp/thumbnails/41321355/41321355.32327621.L",
    "sources": {
      "niconico": [
        {
          "id": "sm41321355",
          "title": "これで私は所持金が底をついたので：草",
          "link": "https://www.nicovideo.jp/watch/sm41321355",
          "upload_date": "2022-11-03T17:58:02+09:00"
        }
      ],
      "youtube": [],
      "bilibili": []
    },
    "creators": [{ "id": "1", "name": "D-sub" }],
    "tags": [
      { "id": "1", "name_primary": "ウエライド：草", "context": null, "type": "BACKGROUND_MUSIC" },
      { "id": "2", "name_primary": "ぼっち・ざ・ろっく！", "context": null, "type": "ANIME" },
      { "id": "3", "name_primary": "山田リョウ", "context": "ぼっち・ざ・ろっく！", "type": "CHARACTER" },
      { "id": "4", "name_primary": "伊地知虹夏", "context": "ぼっち・ざ・ろっく！", "type": "CHARACTER" },
      { "id": "5", "name_primary": "喜多郁代", "context": "ぼっち・ざ・ろっく！", "type": "CHARACTER" },
      { "id": "6", "name_primary": "後藤ひとり", "context": "ぼっち・ざ・ろっく！", "type": "CHARACTER" }
    ],
    "parent_videos": [],
    "related_videos": [
      {
        "id": "2",
        "title_primary": "ナイト・オブ・ナイツ",
        "image_primary": " http://nicovideo.cdn.nimg.jp/thumbnails/34795653/34795653.71343.L"
      }
    ]
  },
 */

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
    response.status = 404;
    return;
  }

  response.body = result.value;
  return;
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
