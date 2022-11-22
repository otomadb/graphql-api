import { oakCors } from "cors/mod.ts";
import { buildSchema, graphql } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { verifyAccessJWT } from "~/auth/jwt.ts";
import { refreshToken, signin, whoami } from "~/auth/mod.ts";
import { getTag, registerTag, searchTags } from "~/tags/mod.ts";
import { getUser } from "~/users/mod.ts";
import { getVideo, registerVideo, searchVideos } from "~/videos/mod.ts";

const mongoClient = new MongoClient();
await mongoClient.connect("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");

const app = new Application();

const router = new Router();

export const gqlSchema = buildSchema(await Deno.readTextFile(new URL("./sdl.gql", import.meta.url)));
export const gqlRootValue = {
  // query
  video: getVideo,
  tag: getTag,
  searchVideos: searchVideos,
  searchTags: searchTags,
  user: getUser,
  whoami: whoami,

  // mutation
  signin: signin,
  registerTag: registerTag,
  registerVideo: registerVideo,
  refreshToken: refreshToken,
};

router.post(
  "/graphql",
  async ({ state, request }, next) => {
    const accessToken = request.headers.get("Authorization")?.split("Bearer ")?.[1];

    if (!accessToken) {
      await next();
      return;
    }

    try {
      const payload = await verifyAccessJWT({ token: accessToken });
      state.userId = payload?.sub;
    } catch (e) {
      console.dir(e);
    } finally {
      await next();
    }
  },
  async ({ state, request, response }) => {
    const { query, variables, operationName } = await request.body().value;
    const { userId } = state;

    response.body = await graphql({
      source: query,
      schema: gqlSchema,
      rootValue: gqlRootValue,
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

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
