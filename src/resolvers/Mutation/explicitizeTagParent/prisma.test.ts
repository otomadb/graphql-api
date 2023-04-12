import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ErrError, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { explicitize } from "./prisma.js";

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

  test("親子関係が存在しない", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
    ]);

    const actual = (await explicitize(prisma, {
      userId: "u1",
      relationId: "r1",
    })) as ReturnErr<typeof explicitize>;
    expect(actual.status).toBe("error");
    expect(actual.error).toStrictEqual({
      type: "NOT_EXISTS",
      id: "r1",
    } satisfies ErrError<typeof actual>);
  });

  test("既に明示的な親子関係が存在する", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", isCategoryTag: false },
          { id: "t2", isCategoryTag: false },
        ],
      }),
      prisma.tagParent.create({
        data: {
          id: "r1",
          isExplicit: true,
          parentId: "t1",
          childId: "t2",
        },
      }),
    ]);

    const actual = (await explicitize(prisma, {
      userId: "u1",
      relationId: "r1",
    })) as ReturnErr<typeof explicitize>;
    expect(actual.status).toBe("error");
    expect(actual.error).toStrictEqual({
      type: "IS_EXPLICIT",
      relation: expect.objectContaining({
        id: "r1",
        isExplicit: true,
      }),
    } satisfies ErrError<typeof actual>);
  });

  test("非明示的な親子関係を昇格する", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", isCategoryTag: false },
          { id: "t2", isCategoryTag: false },
        ],
      }),
      prisma.tagParent.create({
        data: {
          id: "r1",
          isExplicit: false,
          parentId: "t1",
          childId: "t2",
        },
      }),
    ]);

    const actual = (await explicitize(prisma, {
      userId: "u1",
      relationId: "r1",
    })) as ReturnOk<typeof explicitize>;
    expect(actual.status).toBe("ok");
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: "r1",
        isExplicit: true,
      }) satisfies OkData<typeof actual>
    );
  });
});
