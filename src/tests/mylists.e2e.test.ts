import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql, GraphQLSchema } from "graphql";
import { DataSource } from "typeorm";

import { entities } from "../db/entities/index.js";
import { Mylist } from "../db/entities/mylists.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";

const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

describe("マイリスト関連のE2Eテスト", () => {
  let ds: DataSource;
  let schema: GraphQLSchema;

  let testuser: User;

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

    testuser = new User();
    testuser.id = "1";
    testuser.name = `testuser1`;
    testuser.displayName = "Test User 1";
    testuser.email = `testuser1@example.com`;
    testuser.password = "password";
    testuser.icon = "";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  describe("マイリストからの動画削除", () => {
    let otheruser: User;
    let mylistId: string, otherMylistId: string;
    let videoId: string, otherVideoId: string;

    beforeEach(async () => {
      const createMylistResult = await graphql({
        source: `
        mutation ($input: CreateMylistInput!) {
          createMylist(input: $input) {
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist", range: "PUBLIC" } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

      const createOtherMylistResult = await graphql({
        source: `
        mutation ($input: CreateMylistInput!) {
          createMylist(input: $input) {
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist 2", range: "PUBLIC" } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      otherMylistId = (createOtherMylistResult.data as any).createMylist.mylist.id as string;

      const mutationRegisterVideo = `
      mutation ($input: RegisterVideoInput!) {
        registerVideo(input: $input) {
          video {
            id
          }
        }
      }`;
      const resultRegisterVideo = await graphql({
        source: mutationRegisterVideo,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoId = (resultRegisterVideo.data as any).registerVideo.video.id as string;

      const resultRegisterVideo2 = await graphql({
        source: mutationRegisterVideo,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: {
            primaryTitle: "カゲロウジジイズ",
            primaryThumbnail: "http://nicovideo.cdn.nimg.jp/thumbnails/40926580/40926580.84316399.L",
            tags: [],
            sources: [],
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      otherVideoId = (resultRegisterVideo2.data as any).registerVideo.video.id as string;

      // const resultAddVideoToMylist =
      await graphql({
        source: `
        mutation($input: AddVideoToMylistInput!) {
          addVideoToMylist(input: $input) {
            registration {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId, mylistId, note: "note" },
        },
      });
      // registrationId = (resultAddVideoToMylist.data as any).addVideoToMylist.registration.id as string;

      otheruser = new User();
      otheruser.id = "2";
      otheruser.name = `otheruser`;
      otheruser.displayName = "Other User";
      otheruser.email = `otheruser@example.com`;
      otheruser.password = "password";
      otheruser.icon = "";
      await ds.getRepository(User).insert(otheruser);
    });

    test("removeVideoFromMylist()", async () => {
      const resultRemove = await graphql({
        source: `
        mutation($input: RemoveVideoFromMylistInput!) {
          removeVideoFromMylist(input: $input) {
            video {
              id
            }
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId, mylistId },
        },
      });

      expect(resultRemove.data).toEqual({
        removeVideoFromMylist: {
          video: {
            id: videoId,
          },
          mylist: {
            id: mylistId,
          },
        },
      });
    });

    test("ないマイリストからremoveVideoFromMylist()するとエラー", async () => {
      const result = await graphql({
        source: `
        mutation($input: RemoveVideoFromMylistInput!) {
          removeVideoFromMylist(input: $input) {
            video {
              id
            }
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId, mylistId: otherMylistId },
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();
    });

    test("ない動画をremoveVideoFromMylist()するとエラー", async () => {
      const result = await graphql({
        source: `
        mutation($input: RemoveVideoFromMylistInput!) {
          removeVideoFromMylist(input: $input) {
            video {
              id
            }
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId: otherVideoId, mylistId },
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();
    });
  });

  describe("いいねマイリストからの動画削除", () => {
    let otheruser: User;
    let mylistId: string;
    let videoId: string, otherVideoId: string;

    beforeEach(async () => {
      const createMylistResult = await graphql({
        source: `
        mutation ($input: CreateMylistInput!) {
          createMylist(input: $input) {
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: { input: { title: "Public Mylist", range: "PUBLIC" } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mylistId = (createMylistResult.data as any).createMylist.mylist.id as string;

      await ds.getRepository(Mylist).update({ id: removeIDPrefix(ObjectType.Mylist, mylistId) }, { isLikeList: true });

      const mutationRegisterVideo = `
      mutation ($input: RegisterVideoInput!) {
        registerVideo(input: $input) {
          video {
            id
          }
        }
      }`;
      const resultRegisterVideo = await graphql({
        source: mutationRegisterVideo,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoId = (resultRegisterVideo.data as any).registerVideo.video.id as string;

      const resultRegisterVideo2 = await graphql({
        source: mutationRegisterVideo,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: {
            primaryTitle: "カゲロウジジイズ",
            primaryThumbnail: "http://nicovideo.cdn.nimg.jp/thumbnails/40926580/40926580.84316399.L",
            tags: [],
            sources: [],
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      otherVideoId = (resultRegisterVideo2.data as any).registerVideo.video.id as string;

      // const resultAddVideoToMylist =
      await graphql({
        source: `
        mutation($input: AddVideoToMylistInput!) {
          addVideoToMylist(input: $input) {
            registration {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId, mylistId, note: "note" },
        },
      });
      // registrationId = (resultAddVideoToMylist.data as any).addVideoToMylist.registration.id as string;

      otheruser = new User();
      otheruser.id = "2";
      otheruser.name = `otheruser`;
      otheruser.displayName = "Other User";
      otheruser.email = `otheruser@example.com`;
      otheruser.password = "password";
      otheruser.icon = "";
      await ds.getRepository(User).insert(otheruser);
    });

    test("undoLikeVideo()", async () => {
      const result = await graphql({
        source: `
        mutation($input: UndoLikeVideoInput!) {
          undoLikeVideo(input: $input) {
            video {
              id
            }
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId },
        },
      });

      expect(result.data).toEqual({
        undoLikeVideo: {
          video: {
            id: videoId,
          },
          mylist: {
            id: mylistId,
          },
        },
      });
    });

    test("ない動画をundoLikeVideo()するとエラー", async () => {
      const result = await graphql({
        source: `
        mutation($input: UndoLikeVideoInput!) {
          undoLikeVideo(input: $input) {
            video {
              id
            }
            mylist {
              id
            }
          }
        }`,
        schema,
        contextValue: { user: testuser },
        variableValues: {
          input: { videoId: otherVideoId },
        },
      });

      expect(result.data).toBeNull();
      expect(result.errors).toBeDefined();
    });
  });
});
