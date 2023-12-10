import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../utils/Result.js";
import { register } from "./registerTag.resolver.js";

describe("Register video by Prisma", () => {
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

  test("explicitParentが存在しない場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.video.createMany({
        data: [{ id: "v1" }, { id: "v2" }],
      }),
      prisma.tag.createMany({
        data: [
          { id: "t2", disabled: false },
          { id: "t3", disabled: false },
        ],
      }),
      prisma.semitag.createMany({
        data: [
          { id: "st1", name: "semitag1", videoId: "v1", isChecked: false },
          { id: "st2", name: "semitag2", videoId: "v2", isChecked: false },
        ],
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      primaryName: "PrimaryName",
      extraNames: ["ExtraName 1", "ExtraName 2"],
      explicitParentId: "t1",
      implicitParentIds: ["t2", "t3"],
      semitagIds: ["st1", "st2"],
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "TAG_NOT_FOUND",
      id: "t1",
    } satisfies ErrError<typeof actual>);
  });

  test("implicitParentが存在しない場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.video.createMany({
        data: [{ id: "v1" }, { id: "v2" }],
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", disabled: false },
          { id: "t3", disabled: false },
        ],
      }),
      prisma.semitag.createMany({
        data: [
          { id: "st1", name: "semitag1", videoId: "v1", isChecked: false },
          { id: "st2", name: "semitag2", videoId: "v2", isChecked: false },
        ],
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      primaryName: "PrimaryName",
      extraNames: ["ExtraName 1", "ExtraName 2"],
      explicitParentId: "t1",
      implicitParentIds: ["t2", "t3"],
      semitagIds: ["st1", "st2"],
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "TAG_NOT_FOUND",
      id: "t2",
    } satisfies ErrError<typeof actual>);
  });

  test("semitagが存在しない場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.video.createMany({
        data: [{ id: "v1" }, { id: "v2" }],
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", disabled: false },
          { id: "t2", disabled: false },
          { id: "t3", disabled: false },
        ],
      }),
      prisma.semitag.createMany({
        data: [{ id: "st2", name: "semitag1", videoId: "v2", isChecked: false }],
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      primaryName: "PrimaryName",
      extraNames: [],
      explicitParentId: "t1",
      implicitParentIds: ["t2", "t3"],
      semitagIds: ["st1", "st2"],
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "SEMITAG_NOT_FOUND",
      id: "st1",
    } satisfies ErrError<typeof actual>);
  });

  test("チェック済みのsemitagを解決しようとした場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.video.createMany({
        data: [{ id: "v1" }, { id: "v2" }],
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", disabled: false },
          { id: "t2", disabled: false },
          { id: "t3", disabled: false },
        ],
      }),
      prisma.semitag.createMany({
        data: [
          { id: "st1", name: "semitag1", videoId: "v1", isChecked: false },
          { id: "st2", name: "semitag1", videoId: "v2", isChecked: true },
        ],
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      primaryName: "PrimaryName",
      extraNames: ["ExtraName 1", "ExtraName 2"],
      explicitParentId: "t1",
      implicitParentIds: ["t2", "t3"],
      semitagIds: ["st1", "st2"],
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "SEMITAG_ALREADY_CHECKED",
      id: "st2",
    } satisfies ErrError<typeof actual>);
  });

  test("正常系", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.video.createMany({
        data: [{ id: "v1" }, { id: "v2" }],
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", disabled: false },
          { id: "t2", disabled: false },
          { id: "t3", disabled: false },
        ],
      }),
      prisma.semitag.createMany({
        data: [
          { id: "st1", name: "semitag1", videoId: "v1", isChecked: false },
          { id: "st2", name: "semitag1", videoId: "v2", isChecked: false },
        ],
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      primaryName: "PrimaryName",
      extraNames: ["ExtraName 1", "ExtraName 2"],
      explicitParentId: "t1",
      implicitParentIds: ["t2", "t3"],
      semitagIds: ["st1", "st2"],
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      id: expect.any(String),
      serial: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      disabled: false,
    } satisfies OkData<typeof actual>);

    const actualTagEvents = await prisma.tagEvent.findMany({});
    expect(actualTagEvents).toHaveLength(1);
  });
});
