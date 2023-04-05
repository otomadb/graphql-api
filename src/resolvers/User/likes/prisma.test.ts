import { MylistShareRange, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { get } from "./prisma.js";

describe("Get user likes by Prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("PUBLICないいね欄", () => {
    beforeEach(async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
        }),
        prisma.mylist.create({
          data: {
            id: "m1",
            title: "Mylist 1",
            shareRange: MylistShareRange.PUBLIC,
            isLikeList: true,
            holderId: "u1",
            slug: "likes",
          },
        }),
      ]);
    });

    test("無認証で取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: null })) as ReturnOk<typeof get>;

      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: "m1",
        title: "Mylist 1",
        shareRange: MylistShareRange.PUBLIC,
        isLikeList: true,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });

    test("所有者でないユーザが取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u2" })) as ReturnOk<typeof get>;

      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: "m1",
        title: "Mylist 1",
        shareRange: MylistShareRange.PUBLIC,
        isLikeList: true,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });

    test("所有者が取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u1" })) as ReturnOk<typeof get>;
      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: "m1",
        title: "Mylist 1",
        shareRange: MylistShareRange.PUBLIC,
        isLikeList: true,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });
  });

  describe("KNOW_LINKないいね欄", () => {
    beforeEach(async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
        }),
        prisma.mylist.create({
          data: {
            id: "m1",
            title: "Mylist 1",
            shareRange: MylistShareRange.KNOW_LINK,
            isLikeList: true,
            holderId: "u1",
            slug: "likes",
          },
        }),
      ]);
    });

    test("無認証で取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: null })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({ type: "PRIVATE_MYLIST_NOT_AUTH", mylistId: "m1" } satisfies ErrError<
        typeof actual
      >);
    });

    test("所有者でないユーザが取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u2" })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "PRIVATE_MYLIST_WRONG_HOLDER",
        mylistId: "m1",
        currentUserId: "u2",
      } satisfies ErrError<typeof actual>);
    });

    test("所有者が取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u1" })) as ReturnOk<typeof get>;
      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: "m1",
        title: "Mylist 1",
        shareRange: MylistShareRange.KNOW_LINK,
        isLikeList: true,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });
  });

  describe("PRIVATEないいね欄", () => {
    beforeEach(async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
        }),
        prisma.mylist.create({
          data: {
            id: "m1",
            title: "Mylist 1",
            shareRange: MylistShareRange.PRIVATE,
            isLikeList: true,
            holderId: "u1",
            slug: "likes",
          },
        }),
      ]);
    });

    test("無認証で取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: null })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({ type: "PRIVATE_MYLIST_NOT_AUTH", mylistId: "m1" } satisfies ErrError<
        typeof actual
      >);
    });

    test("所有者でないユーザが取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u2" })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "PRIVATE_MYLIST_WRONG_HOLDER",
        mylistId: "m1",
        currentUserId: "u2",
      } satisfies ErrError<typeof actual>);
    });

    test("所有者が取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u1" })) as ReturnOk<typeof get>;
      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: "m1",
        title: "Mylist 1",
        shareRange: MylistShareRange.PRIVATE,
        isLikeList: true,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });
  });

  describe("いいね欄が作られていない場合はPRIVATEとして作成", () => {
    beforeEach(async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
        }),
      ]);
    });

    test("無認証で取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: null })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "PRIVATE_MYLIST_NOT_AUTH",
        mylistId: expect.any(String),
      } satisfies ErrError<typeof actual>);
    });

    test("所有者でないユーザが取得しようとするとエラー", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u2" })) as ReturnErr<typeof get>;

      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "PRIVATE_MYLIST_WRONG_HOLDER",
        mylistId: expect.any(String),
        currentUserId: "u2",
      } satisfies ErrError<typeof actual>);
    });

    test("所有者が取得して成功", async () => {
      const actual = (await get(prisma, { holderId: "u1", currentUserId: "u1" })) as ReturnOk<typeof get>;
      expect(isOk(actual)).toBe(true);
      expect(actual.data).toStrictEqual({
        id: expect.any(String),
        title: "likes",
        shareRange: MylistShareRange.PRIVATE,
        isLikeList: false,
        holderId: "u1",
        slug: "likes",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      } satisfies OkData<typeof actual>);
    });
  });
});
