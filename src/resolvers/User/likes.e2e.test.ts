import { MylistShareRange, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../test/cleanPrisma.js";
import { Err, err, Ok, ok } from "../../utils/Result.js";
import { ResolverDeps } from "../index.js";
import { get } from "./likes.js";

describe("User.likes", () => {
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
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = await get(prisma, { holderId: "u1", authUserId: null });
    expect(actual).toStrictEqual(err("PRIVATE_NOT_HOLDER") satisfies Err<Awaited<ReturnType<typeof get>>>);
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
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = await get(prisma, { holderId: "u1", authUserId: "u2" });
    expect(actual).toStrictEqual(err("PRIVATE_NOT_HOLDER") satisfies Err<Awaited<ReturnType<typeof get>>>);
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
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.PRIVATE,
        },
      }),
    ]);

    const actual = await get(prisma, { holderId: "u1", authUserId: null });
    expect(actual).toStrictEqual(err("PRIVATE_NOT_HOLDER") satisfies Err<Awaited<ReturnType<typeof get>>>);
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
          title: "Mylist 1",
          holderId: "u1",
          isLikeList: true,
          shareRange: MylistShareRange.KNOW_LINK,
        },
      }),
    ]);

    const actual = await get(prisma, { holderId: "u1", authUserId: "u2" });
    expect(actual).toStrictEqual(err("PRIVATE_NOT_HOLDER") satisfies Err<Awaited<ReturnType<typeof get>>>);
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

    const actual = await get(prisma, { holderId: "u1", authUserId: null });
    expect(actual).toStrictEqual(
      ok(
        expect.objectContaining({
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        } satisfies Partial<Ok<Awaited<ReturnType<typeof get>>>["data"]>)
      )
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

    const actual = await get(prisma, { holderId: "u1", authUserId: null });
    expect(actual).toStrictEqual(
      ok(
        expect.objectContaining({
          id: "m1",
          title: "Mylist 1",
          holderId: "u1",
        } satisfies Partial<Ok<Awaited<ReturnType<typeof get>>>["data"]>)
      )
    );
  });
});
