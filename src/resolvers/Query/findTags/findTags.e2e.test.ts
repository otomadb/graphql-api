import { describe } from "vitest";

describe("findTags", () => {
  /*
  let prisma: ResolverDeps["prisma"];

  let findTags: ReturnType<typeof findTagsScaffold>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    findTags = findTagsScaffold({ prisma, logger });
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
      prisma.tag.create({ data: { id: tagId, isCategoryTag: false } }),
      prisma.tagName.create({ data: { id: ulid(), tagId, name: "name", isPrimary: false } }),
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
          isCategoryTag: false,
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
          { id: child1Id, isCategoryTag: false },
          { id: child2Id, isCategoryTag: false },
          { id: parent1Id, isCategoryTag: false },
          { id: parent2Id, isCategoryTag: false },
        ],
      }),
      prisma.tagName.createMany({
        data: [
          { id: ulid(), tagId: child1Id, name: "name", isPrimary: false },
          { id: ulid(), tagId: parent1Id, name: "parent_t1", isPrimary: false },

          { id: ulid(), tagId: child2Id, name: "name", isPrimary: false },
          { id: ulid(), tagId: parent2Id, name: "parent_t2", isPrimary: false },
        ],
      }),
      prisma.tagParent.createMany({
        data: [
          { id: ulid(), parentId: parent1Id, childId: child1Id, isExplicit: false },
          { id: ulid(), parentId: parent2Id, childId: child2Id, isExplicit: false },
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
          isCategoryTag: false,
        }),
        expect.objectContaining({
          id: child2Id,
          isCategoryTag: false,
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
          { id: child1Id, isCategoryTag: false },
          { id: child2Id, isCategoryTag: false },
          { id: parent1Id, isCategoryTag: false },
          { id: parent2Id, isCategoryTag: false },
        ],
      }),
      prisma.tagName.createMany({
        data: [
          { id: ulid(), tagId: child1Id, name: "name", isPrimary: false },
          { id: ulid(), tagId: parent1Id, name: "parent_t1", isPrimary: false },

          { id: ulid(), tagId: child2Id, name: "name", isPrimary: false },
          { id: ulid(), tagId: parent2Id, name: "parent_t2", isPrimary: false },
        ],
      }),
      prisma.tagParent.createMany({
        data: [
          { id: ulid(), parentId: parent1Id, childId: child1Id, isExplicit: false },
          { id: ulid(), parentId: parent2Id, childId: child2Id, isExplicit: false },
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
          isCategoryTag: false,
        }),
      ])
    );
  });
  */
});
