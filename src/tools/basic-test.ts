import { readFile } from "node:fs/promises";
import { dirname } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";
import { z, ZodType } from "zod";

import { entities } from "../db/entities/index.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

export const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  migrations: [`${dirname(new URL(import.meta.url).pathname)}/db/migrations/*.ts`],
});
await dataSource.initialize();
await dataSource.dropDatabase();
await dataSource.synchronize();

const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers({ dataSource }) });

const user = new User();
user.id = ulid();
user.name = `TestUser_${user.id}`;
user.displayName = user.name;
user.email = `${user.id}@example.com`;
user.password = "fakeuser";
user.icon = "";

await dataSource.getRepository(User).insert(user);

export async function runGraphQLQuery<T extends ZodType>(zType: z.infer<T>, source: string, variableValues: any) {
  const res = await graphql({
    contextValue: { user },
    source,
    schema,
    variableValues,
  });
  try {
    return zType.parse(res);
  } catch (e) {
    console.error(JSON.stringify(res, null, 4));
  }
}

const zCreateTagRes = z.object({
  data: z.object({
    registerTag: z.object({
      tag: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const queryForRegisterTag = `mutation ($input: RegisterTagInput!) {
    registerTag(input: $input) {
        tag {
            id
        }
    }
}`;

const createParentTag = await runGraphQLQuery(zCreateTagRes, queryForRegisterTag, {
  input: {
    primaryName: "東方",
    extraNames: ["Touhou"],
  },
});

const createTag = await runGraphQLQuery(zCreateTagRes, queryForRegisterTag, {
  input: {
    primaryName: "U.N.オーエンは彼女なのか？",
    extraNames: ["U.N. Owen Was Her?"],
    explicitParent: createParentTag.data.registerTag.tag.id,
  },
}).then((r) => zCreateTagRes.parse(r));

const queryForRegisterVideo = `mutation ($input: RegisterVideoInput!) {
    registerVideo(input: $input) {
        video {
            id
        }
    }
}`;
const zCreateVideoRes = z.object({
  data: z.object({
    registerVideo: z.object({
      video: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const createVideo = await runGraphQLQuery(zCreateVideoRes, queryForRegisterVideo, {
  input: {
    primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
    extraTitles: ["Ronald McDonald insanity"],
    tags: [createTag.data.registerTag.tag.id],
    primaryThumbnail:
      "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
    sources: [
      {
        type: "NICOVIDEO",
        sourceId: "sm2057168",
      },
    ],
  },
});

console.log(createVideo);

await dataSource.destroy();
