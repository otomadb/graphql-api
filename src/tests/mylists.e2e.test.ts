import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLSchema } from "graphql";
import { DataSource } from "typeorm";

import { entities } from "../db/entities/index.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

describe("マイリスト関連のE2Eテスト", () => {
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
      entities,
      migrations: [`${(resolve(dirname(new URL(import.meta.url).pathname)), "../db/migrations")}/*.ts`],
    });
    await ds.initialize();

    schema = makeExecutableSchema({
      typeDefs,
      resolvers: resolvers({ dataSource: ds }),
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

  describe("公開マイリスト", () => {
    test("作成", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist", range: "PUBLIC" } },
      });

      expect(createMylistResult.data).toEqual({
        createMylist: {
          mylist: {
            id: expect.any(String),
            // title: "Public Mylist",
            range: "PUBLIC",
          },
        },
      });
    });

    test("取得", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist", range: "PUBLIC" } },
      });
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string; // TODO: ID生成部分モックするとかしてなんとかする

      const queryGetMylist = `
      query($id: ID!) {
        mylist(id: $id) {
          id
        }
      }`;
      const getMylistResult = await graphql({
        source: queryGetMylist,
        schema,
        contextValue: {},
        variableValues: { id: mylistId },
      });

      expect(getMylistResult.data).toEqual({
        mylist: {
          id: expect.any(String),
        },
      });
    });
  });

  describe("リンク公開マイリスト", () => {
    test("作成", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "KnowLink Mylist", range: "KNOW_LINK" } },
      });

      expect(createMylistResult.data).toEqual({
        createMylist: {
          mylist: {
            id: expect.any(String),
            // title: "Public Mylist",
            range: "KNOW_LINK",
          },
        },
      });
    });

    test("取得", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "KnowLink Mylist", range: "KNOW_LINK" } },
      });
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string; // TODO: ID生成部分モックするとかしてなんとかする

      const queryGetMylist = `
      query($id: ID!) {
        mylist(id: $id) {
          id
        }
      }`;
      const getMylistResult = await graphql({
        source: queryGetMylist,
        schema,
        contextValue: {},
        variableValues: { id: mylistId },
      });

      expect(getMylistResult.data).toEqual({
        mylist: {
          id: expect.any(String),
        },
      });
    });
  });

  describe("非公開マイリスト", () => {
    test("作成", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Private Mylist", range: "PRIVATE" } },
      });

      expect(createMylistResult.data).toEqual({
        createMylist: {
          mylist: {
            id: expect.any(String),
            // title: "Public Mylist",
            range: "PRIVATE",
          },
        },
      });
    });

    test("認証なしで取得してエラー", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Private Mylist", range: "PRIVATE" } },
      });
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string; // TODO: ID生成部分モックするとかしてなんとかする

      const queryGetMylist = `
      query($id: ID!) {
        mylist(id: $id) {
          id
        }
      }`;
      const getMylistResult = await graphql({
        source: queryGetMylist,
        schema,
        contextValue: {},
        variableValues: { id: mylistId },
      });

      expect(getMylistResult.data).toBeNull();
      expect(getMylistResult.errors).toBeDefined(); // TODO: 後で
    });

    test("認証ありで取得", async () => {
      const mutationCreateMylist = `
      mutation ($input: CreateMylistInput!) {
        createMylist(input: $input) {
          mylist {
            id
            # title
            range
          }
        }
      }`;
      const createMylistResult = await graphql({
        source: mutationCreateMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Private Mylist", range: "PRIVATE" } },
      });
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string; // TODO: ID生成部分モックするとかしてなんとかする

      const queryGetMylist = `
      query($id: ID!) {
        mylist(id: $id) {
          id
        }
      }`;
      const getMylistResult = await graphql({
        source: queryGetMylist,
        schema,
        contextValue: { user: testuser },
        variableValues: { id: mylistId },
      });

      expect(getMylistResult.data).toEqual({
        mylist: { id: expect.any(String) },
      });
    });
  });

  describe("マイリストへの動画追加", () => {
    let otheruser: User;

    let mylistId: string;
    let videoId: string;

    beforeEach(async () => {
      const createMylistResult = await graphql({
        source: `
        mutation ($input: CreateMylistInput!) {
          createMylist(input: $input) {
            mylist {
              id
              # title
              range
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist", range: "PUBLIC" } },
      });
      mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

      const registerVideoResult = await graphql({
        source: `
        mutation ($input: RegisterVideoInput!) {
          registerVideo(input: $input) {
            video {
              id
              title
              thumbnailUrl
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: {
            primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
            primaryThumbnail:
              "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
            tags: [],
            sources: [],
          },
        },
      });
      videoId = (registerVideoResult.data as any).registerVideo.video.id as string;

      otheruser = new User();
      otheruser.id = "2";
      otheruser.name = `otheruser`;
      otheruser.displayName = "Other User";
      otheruser.email = `otheruser@example.com`;
      otheruser.password = "password";
      otheruser.icon = "";
      await ds.getRepository(User).insert(otheruser);
    });

    test("自分のリストに追加", async () => {
      const resultAddVideoToMylist = await graphql({
        source: `
        mutation($input: AddVideoToMylistInput!) {
          addVideoToMylist(input: $input) {
            id
            registration {
              id
              note
              video {
                id
              }
              mylist {
                id
              }
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: {
            videoId,
            mylistId,
            note: "note",
          },
        },
      });

      expect(resultAddVideoToMylist.data).toEqual({
        addVideoToMylist: {
          id: expect.any(String),
          registration: {
            id: expect.any(String),
            note: "note",
            video: {
              id: videoId,
            },
            mylist: {
              id: mylistId,
            },
          },
        },
      });
    });

    test("他人のリストに追加してエラー", async () => {
      const resultAddVideoToMylist = await graphql({
        source: `
        mutation($input: AddVideoToMylistInput!) {
          addVideoToMylist(input: $input) {
            id
            registration {
              id
              note
              video {
                id
              }
              mylist {
                id
              }
            }
          }
        }`,
        schema,
        contextValue: { user: otheruser },
        variableValues: {
          input: {
            videoId,
            mylistId,
            note: "note",
          },
        },
      });

      expect(resultAddVideoToMylist.data).toBeNull();
      expect(resultAddVideoToMylist.errors).toBeDefined();
    });

    test("追加後に追加に関するデータを取得", async () => {
      await graphql({
        source: `
        mutation($input: AddVideoToMylistInput!) {
          addVideoToMylist(input: $input) {
            id
            registration {
              id
              note
              video {
                id
              }
              mylist {
                id
              }
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: {
            videoId,
            mylistId,
            note: "note",
          },
        },
      });

      const resultGetMylist = await graphql({
        source: `
        query($id: ID!) {
          mylist(id: $id) {
            registrations(input: {}) {
              nodes {
                id
              }
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: { id: mylistId },
      });

      expect(resultGetMylist.data).toEqual({
        mylist: {
          registrations: {
            nodes: [{ id: expect.any(String) }],
          },
        },
      });
    });
  });
});
