import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLSchema } from "graphql";
import neo4j, { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { entities } from "../db/entities/index.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

describe("basic e2e", () => {
  let ds: DataSource;
  let neo4jDriver: Neo4jDriver;
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
      url: process.env.TEST_DATABASE_URL,
      entities,
      migrations: [`${(resolve(dirname(new URL(import.meta.url).pathname)), "../db/migrations")}/*.ts`],
    });
    await ds.initialize();

    neo4jDriver = neo4j.driver(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.TEST_NEO4J_URL!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      neo4j.auth.basic(process.env.TEST_NEO4J_USERNAME!, process.env.TEST_NEO4J_PASSWORD!)
    );

    schema = makeExecutableSchema({
      typeDefs,
      resolvers: resolvers({ dataSource: ds, neo4jDriver }),
    });
  });

  beforeEach(async () => {
    await ds.dropDatabase();
    await ds.synchronize();
    await ds.getRepository(User).insert(testuser);
  });

  afterAll(async () => {
    await ds.destroy();
    await neo4jDriver.close();
  });

  test("タグを登録", async () => {
    const mutationRegisterTag = `
    mutation ($input: RegisterTagInput!) {
      registerTag(input: $input) {
        tag {
          id
          name
        }
      }
    }`;

    const registerTagResult = await graphql({
      source: mutationRegisterTag,
      schema,
      contextValue: { user: testuser },
      variableValues: {
        input: {
          primaryName: "U.N.オーエンは彼女なのか？",
          extraNames: ["U.N. Owen Was Her?"],
        },
      },
    });

    expect(registerTagResult.data).toEqual({
      registerTag: {
        tag: {
          id: expect.any(String),
          name: "U.N.オーエンは彼女なのか？",
        },
      },
    });
  });

  test("動画を登録", async () => {
    const mutationRegisterTag = `
    mutation ($input: RegisterTagInput!) {
      registerTag(input: $input) {
        tag {
          id
          name
        }
      }
    }`;

    const registerTagResult = await graphql({
      source: mutationRegisterTag,
      schema,
      contextValue: { user: testuser },
      variableValues: {
        input: {
          primaryName: "U.N.オーエンは彼女なのか？",
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagId = (registerTagResult.data as any).registerTag.tag.id as string;

    const queryForRegisterVideo = `
    mutation ($input: RegisterVideoInput!) {
      registerVideo(input: $input) {
        video {
          id
          title
          thumbnailUrl
        }
      }
    }`;
    const registerVideoResult = await graphql({
      source: queryForRegisterVideo,
      schema,
      contextValue: { user: testuser },
      variableValues: {
        input: {
          primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
          extraTitles: ["Ronald McDonald insanity"],
          tags: [tagId],
          primaryThumbnail:
            "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
          sources: [{ type: "NICOVIDEO", sourceId: "sm2057168" }],
        },
      },
    });

    expect(registerVideoResult.data).toEqual({
      registerVideo: {
        video: {
          id: expect.any(String),
          title: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
          thumbnailUrl:
            "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
        },
      },
    });
  });
});
