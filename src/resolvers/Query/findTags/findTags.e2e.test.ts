import { PrismaClient } from "@prisma/client";
import { ulid } from "ulid";

import { SortOrder } from "../../../graphql.js";
import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../index.js";
import { findTags as findTagsScaffold } from "./findTags.js";

describe("findTags", () => {
  let prisma: ResolverDeps["prisma"];

  let findTags: ReturnType<typeof findTagsScaffold>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    findTags = findTagsScaffold({ prisma });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("何もタグを登録していない", async () => {
    const { nodes } = await findTags(
      {},
      {
        input: {
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
        },
      }
    );
    expect(nodes).toStrictEqual([]);
  });

  test("inputにnameを入れて取得する", async () => {
    const tagId = ulid();
    await prisma.$transaction([
      prisma.tag.create({ data: { id: tagId, meaningless: false } }),
      prisma.tagName.create({ data: { tagId, name: "name", isPrimary: false } }),
    ]);

    const { nodes } = await findTags(
      {},
      {
        input: {
          name: "name",
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
        },
      }
    );
    expect(nodes).toHaveLength(1);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tagId,
          meaningless: false,
        }),
      ])
    );
  });

  test("inputにnameを入れ，parentを区別せずに取得する", async () => {
    const child1Id = ulid();
    const parent1Id = ulid();

    const child2Id = ulid();
    const parent2Id = ulid();

    await prisma.$transaction([
      // parent
      prisma.tag.createMany({
        data: [
          { id: child1Id, meaningless: false },
          { id: child2Id, meaningless: false },
          { id: parent1Id, meaningless: false },
          { id: parent2Id, meaningless: false },
        ],
      }),
      prisma.tagName.createMany({
        data: [
          { tagId: child1Id, name: "name", isPrimary: false },
          { tagId: parent1Id, name: "parent_t1", isPrimary: false },

          { tagId: child2Id, name: "name", isPrimary: false },
          { tagId: parent2Id, name: "parent_t2", isPrimary: false },
        ],
      }),
      prisma.tagParent.createMany({
        data: [
          { parentId: parent1Id, childId: child1Id, isExplicit: false },
          { parentId: parent2Id, childId: child2Id, isExplicit: false },
        ],
      }),
    ]);

    const { nodes } = await findTags(
      {},
      {
        input: {
          name: "name",
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
        },
      }
    );
    expect(nodes).toHaveLength(2);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: child1Id,
          meaningless: false,
        }),
        expect.objectContaining({
          id: child2Id,
          meaningless: false,
        }),
      ])
    );
  });

  test("inputにnameを入れ，parentを区別して取得する", async () => {
    const child1Id = ulid();
    const parent1Id = ulid();

    const child2Id = ulid();
    const parent2Id = ulid();

    await prisma.$transaction([
      // parent
      prisma.tag.createMany({
        data: [
          { id: child1Id, meaningless: false },
          { id: child2Id, meaningless: false },
          { id: parent1Id, meaningless: false },
          { id: parent2Id, meaningless: false },
        ],
      }),
      prisma.tagName.createMany({
        data: [
          { tagId: child1Id, name: "name", isPrimary: false },
          { tagId: parent1Id, name: "parent_t1", isPrimary: false },

          { tagId: child2Id, name: "name", isPrimary: false },
          { tagId: parent2Id, name: "parent_t2", isPrimary: false },
        ],
      }),
      prisma.tagParent.createMany({
        data: [
          { parentId: parent1Id, childId: child1Id, isExplicit: false },
          { parentId: parent2Id, childId: child2Id, isExplicit: false },
        ],
      }),
    ]);

    const { nodes } = await findTags(
      {},
      {
        input: {
          name: "name",
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
          parents: [parent1Id],
        },
      }
    );
    expect(nodes).toHaveLength(1);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: child1Id,
          meaningless: false,
        }),
      ])
    );
  });
});
