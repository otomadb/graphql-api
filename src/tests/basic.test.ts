import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLSchema } from "graphql";
import { DataSource } from "typeorm";

import { Session } from "../db/entities/sessions.js";
import { TagName } from "../db/entities/tag_names.js";
import { TagParent } from "../db/entities/tag_parents.js";
import { Tag } from "../db/entities/tags.js";
import { User } from "../db/entities/users.js";
import { VideoSource } from "../db/entities/video_sources.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle } from "../db/entities/video_titles.js";
import { Video } from "../db/entities/videos.js";
import { mkResolvers } from "../resolvers/index.js";

const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

describe("e2e", () => {
  let ds: DataSource;
  let schema: GraphQLSchema;

  const testuser = new User();
  testuser.id = "1";
  testuser.name = `testuser1`;
  testuser.displayName = "Test User 1";
  testuser.email = `testuser1@example.com`;
  testuser.password = "password";
  testuser.icon = "";

  beforeAll(async () => {
    ds = new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [Tag, TagName, TagParent, VideoTitle, VideoThumbnail, VideoTag, VideoSource, Session, User, Video],
      migrations: [`${(resolve(dirname(new URL(import.meta.url).pathname)), "../db/migrations")}/*.ts`],
    });
    await ds.initialize();

    schema = makeExecutableSchema({
      typeDefs,
      resolvers: mkResolvers({ ds }),
    });
  });

  beforeEach(async () => {
    await ds.dropDatabase();
    await ds.synchronize();
    await ds.getRepository(User).insert(testuser);
  });

  afterAll(async () => {
    await ds.destroy();
  });

  test("タグを登録", async () => {
    const source = `
    mutation ($input: RegisterTagInput!) {
      registerTag(input: $input) {
        tag {
          id
        }
      }
    }`;

    const result = await graphql({
      source,
      schema,
      contextValue: { user: testuser },
      variableValues: {
        input: {
          primaryName: "U.N.オーエンは彼女なのか？",
          extraNames: ["U.N. Owen Was Her?"],
        },
      },
    });

    console.dir(result);
  });
});
