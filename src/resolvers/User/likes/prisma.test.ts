import { MylistShareRange, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";
import { get } from "./prisma.js";

describe("Get user likes by Prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("いいね欄はPRIVATEで，認証していない", async () => {
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
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: null })) as ReturnErr<typeof get>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual("PRIVATE_NOT_HOLDER" satisfies ErrError<typeof actual>);
  });

  test("いいね欄はPRIVATEで，認証しているが，いいね欄の持ち主ではない", async () => {
    await prisma.$transaction([
      prisma.user.createMany({
        data: [
          {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
          {
            id: "u2",
            name: "user2",
            displayName: "User2",
            email: "user2@example.com",
            password: "password",
          },
        ],
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: "u2" })) as ReturnErr<typeof get>;
    expect(isErr(actual)).toBe(true);
    expect(actual).toStrictEqual("PRIVATE_NOT_HOLDER" satisfies ErrError<typeof actual>);
  });

  test("いいね欄はKNOW_LINKで，認証していない", async () => {
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
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: null })) as ReturnErr<typeof get>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual("PRIVATE_NOT_HOLDER" satisfies ErrError<typeof actual>);
  });

  test("いいね欄はKNOW_LINKで，認証しているが，いいね欄の持ち主ではない", async () => {
    await prisma.$transaction([
      prisma.user.createMany({
        data: [
          {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
          {
            id: "u2",
            name: "user2",
            displayName: "User2",
            email: "user2@example.com",
            password: "password",
          },
        ],
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.KNOW_LINK,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: "u2" })) as ReturnErr<typeof get>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual("PRIVATE_NOT_HOLDER" satisfies ErrError<typeof actual>);
  });

  test("いいね欄はPUBLIC", async () => {
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
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PUBLIC,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: null })) as ReturnOk<typeof get>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: "m1",
        title: "Mylist 1",
        holderId: "u1",
      }) satisfies OkData<typeof actual>
    );
  });

  test("いいね欄がPUBLICなら，認証したユーザが違っても取得可能", async () => {
    await prisma.$transaction([
      prisma.user.createMany({
        data: [
          {
            id: "u1",
            name: "user1",
            displayName: "User1",
            email: "user1@example.com",
            password: "password",
          },
          {
            id: "u2",
            name: "user2",
            displayName: "User2",
            email: "user2@example.com",
            password: "password",
          },
        ],
      }),
      prisma.mylist.create({
        data: {
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PUBLIC,
        },
      }),
    ]);

    const actual = (await get(prisma, { holderId: "u1", authUserId: null })) as ReturnOk<typeof get>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: "m1",
        title: "Mylist 1",
        holderId: "u1",
      }) satisfies OkData<typeof actual>
    );
  });
});
