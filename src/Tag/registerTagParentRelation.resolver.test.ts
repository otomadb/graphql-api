import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../utils/Result.js";
import { register } from "./registerTagParentRelation.resolver.js";

describe("Register tag parent relation in Prisma", () => {
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

  test("親タグが存在しない場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      /*
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),
      */
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
    ]);

    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "PARENT_TAG_NOT_FOUND",
      tagId: "t1",
    } satisfies ErrError<typeof actual>);
  });

  test("子タグが存在しない場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),

      /*
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
      */
    ]);
    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "CHILD_TAG_NOT_FOUND",
      tagId: "t2",
    } satisfies ErrError<typeof actual>);
  });

  test("親子関係が既に存在する場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
      prisma.tagParent.create({
        data: {
          id: "r1",
          parentId: "t1",
          childId: "t2",
          isExplicit: false,
        },
      }),
    ]);
    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "ALREADY_REGISTERED",
      relation: {
        id: "r1",
        parentId: "t1",
        childId: "t2",
        isExplicit: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        disabled: false,
      },
    } satisfies ErrError<typeof actual>);
  });

  test("子タグに既に明示的な親子関係が存在する場合", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t3", isCategoryTag: false },
      }),
      prisma.tagParent.create({
        data: {
          id: "r1",
          parentId: "t3",
          childId: "t2",
          isExplicit: true,
        },
      }),
    ]);
    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnErr<typeof register>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "EXPLICIT_RELATION",
      relation: {
        id: "r1",
        parentId: "t3",
        childId: "t2",
        isExplicit: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        disabled: false,
      },
    } satisfies ErrError<typeof actual>);
  });

  test("正常系", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
    ]);
    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      id: expect.any(String),
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      disabled: false,
    } satisfies OkData<typeof actual>);
  });

  test("子タグに非明示的な親子関係がある場合は追加に成功する", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.create({
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t2", isCategoryTag: false },
      }),
      prisma.tag.create({
        data: { id: "t3", isCategoryTag: false },
      }),
      prisma.tagParent.create({
        data: {
          id: "r1",
          parentId: "t3",
          childId: "t2",
          isExplicit: false,
        },
      }),
    ]);
    const actual = (await register(prisma, {
      userId: "u1",
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      id: expect.any(String),
      parentId: "t1",
      childId: "t2",
      isExplicit: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      disabled: false,
    } satisfies OkData<typeof actual>);
  });
});
