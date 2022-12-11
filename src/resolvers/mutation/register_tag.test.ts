import { GraphQLResolveInfo } from "graphql";
import neo4j, { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { Context } from "../../context.js";
import { entities } from "../../db/entities.js";
import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { Tag } from "../../db/entities/tags.js";
import { User } from "../../db/entities/users.js";
import { migrations } from "../../db/migrations.js";
import { TagModel } from "../../graphql/models.js";
import { calcNameParentPair, registerTag } from "./register_tag.js";

describe("Mutation.registerTag", () => {
  test("is defined", () => {
    expect(registerTag({} as { dataSource: DataSource; neo4jDriver: Neo4jDriver })).toBeDefined();
  });

  test.todo("contextにuserがない場合は認証エラー");

  test.each([
    ["a", [], "1", [], [{ name: "a", parent: "1" }]],
    [
      "a",
      ["b"],
      "1",
      [],
      [
        { name: "a", parent: "1" },
        { name: "b", parent: "1" },
      ],
    ],
    [
      "a",
      [],
      "1",
      ["2"],
      [
        { name: "a", parent: "1" },
        { name: "a", parent: "2" },
      ],
    ],
    [
      "a",
      ["b"],
      "1",
      ["2"],
      [
        { name: "a", parent: "1" },
        { name: "a", parent: "2" },
        { name: "b", parent: "1" },
        { name: "b", parent: "2" },
      ],
    ],
    ["a", [], null, [], [{ name: "a", parent: null }]],
    ["a", [], null, ["2"], [{ name: "a", parent: "2" }]],
  ])(
    "calcNameParentPair() %#",
    (
      primaryName,
      extraNames,
      explicitParent,
      implicitParents,
      expected: ({ name: string; parent: string } | { name: string; parent: null })[]
    ) => {
      const actual = calcNameParentPair({
        primaryName,
        extraNames,
        explicitParent,
        implicitParents,
      });

      expect(actual.length).toBe(expected.length);
      expect(actual).toStrictEqual(expect.arrayContaining(expected));
    }
  );

  describe("with DB", () => {
    let ds: DataSource;
    let neo4jDriver: Neo4jDriver;

    let testuser: User;

    beforeAll(async () => {
      ds = new DataSource({
        type: "postgres",
        url: process.env.TEST_DATABASE_URL,
        entities,
        migrations, // [`${(resolve(dirname(new URL(import.meta.url).pathname)), "../db/migrations")}/*.ts`],
      });
      await ds.initialize();

      neo4jDriver = neo4j.driver(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.TEST_NEO4J_URL!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        neo4j.auth.basic(process.env.TEST_NEO4J_USERNAME!, process.env.TEST_NEO4J_PASSWORD!)
      );
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

      const neo4jSession = neo4jDriver.session();
      try {
        await neo4jSession.run("MATCH (n) DETACH DELETE n");
      } finally {
        await neo4jSession.close();
      }
    });

    afterAll(async () => {
      await ds.destroy();
      await neo4jDriver.close();
    });

    test("primaryNameだけでタグを登録する", async () => {
      const registerResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(registerResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag } = registerResult!;
      expect(tag).toStrictEqual(
        new TagModel({
          id: expect.any(String),
          meaningless: false,
        })
      );

      const names = await ds.getRepository(TagName).find({
        where: { name: "a" },
        relations: { tag: true },
      });
      expect(names).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualTagName = names.at(0)!;
      expect(actualTagName).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: "a",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          primary: true,
          tag: expect.objectContaining({
            id: (tag as Tag).id,
          }),
        })
      );
    });

    test.todo("meaninglessフラグには権限が必要");

    test("meaninglessフラグを立てて登録する", async () => {
      const registerResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", meaningless: true } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(registerResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag } = registerResult!;
      expect(tag).toStrictEqual(
        new TagModel({
          id: expect.any(String),
          meaningless: true,
        })
      );
    });

    test("primaryNameとextraNamesで登録", async () => {
      const registerResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", extraNames: ["b"] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(registerResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: registeredTag } = registerResult as { tag: Tag };

      const actualNamesA = await ds.getRepository(TagName).find({
        where: { name: "a" },
        relations: { tag: true },
      });
      expect(actualNamesA).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualTagNameA = actualNamesA.at(0)!;
      expect(actualTagNameA).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: "a",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          primary: true,
          tag: expect.objectContaining({
            id: (registeredTag as Tag).id,
          }),
        })
      );

      const actualNamesB = await ds.getRepository(TagName).find({
        where: { name: "b" },
        relations: { tag: true },
      });
      expect(actualNamesA).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualTagNameB = actualNamesB.at(0)!;
      expect(actualTagNameB).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: "b",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          primary: false,
          tag: expect.objectContaining({
            id: (registeredTag as Tag).id,
          }),
        })
      );
    });

    test("primaryNameが既存のprimaryNameと重複してエラー", async () => {
      /* already */
      const already = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: alreadyTag } = already as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a" } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "a" is reserved in "tag:${alreadyTag.id}"`);
    });

    test("primaryNameが既存のextraNamesと重複してエラー", async () => {
      /* already */
      const already = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", extraNames: ["A"] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: alreadyTag } = already as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "A" } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "A" is reserved in "tag:${alreadyTag.id}"`);
    });

    test("extraNamesが既存のprimaryNameと重複してエラー", async () => {
      /* already */
      const already = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: alreadyTag } = already as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "b", extraNames: ["a"] } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "a" is reserved in "tag:${alreadyTag.id}"`);
    });

    test("extraNamesが既存のextraNamesと重複してエラー", async () => {
      /* already */
      const already = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", extraNames: ["A"] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: alreadyTag } = already as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "b", extraNames: ["A"] } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "A" is reserved in "tag:${alreadyTag.id}"`);
    });

    test("存在しないタグをexplicitParentとして指定するとエラー", async () => {
      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a", explicitParent: "tag:p" } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('"tag:p" is specified as parent but not exists');
    });

    test("explicitParentだけを入れて登録する", async () => {
      const parentResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "p" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: parentTag } = parentResult! as { tag: Tag };

      const registerResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", explicitParent: `tag:${parentTag.id}` } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(registerResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: registeredTag } = registerResult! as { tag: Tag };

      const parentRels = await ds.getRepository(TagParent).find({
        where: { parent: { id: parentTag.id }, child: { id: registeredTag.id } },
        relations: { parent: true, child: true },
      });
      expect(parentRels).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parentRel = parentRels.at(0)!;
      expect(parentRel).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          explicit: true,
          parent: expect.objectContaining({
            id: parentTag.id,
          }),
          child: expect.objectContaining({
            id: registeredTag.id,
          }),
        })
      );

      const findResult = await ds.getRepository(Tag).findOne({
        where: { id: registeredTag.id },
        relations: ["tagNames", "tagParents", "tagParents.parent", "tagParents.child"],
      });
      expect(findResult).toStrictEqual(
        expect.objectContaining({
          id: registeredTag.id,
          tagNames: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: "a",
              primary: true,
            }),
          ]),
          tagParents: expect.arrayContaining([
            expect.objectContaining({
              parent: expect.objectContaining({ id: parentTag.id }),
              child: expect.objectContaining({ id: registeredTag.id }),
              explicit: true,
            }),
          ]),
        })
      );
    });

    test("存在しないタグをimplicitParentsとして指定するとエラー", async () => {
      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a", implicitParents: ["tag:p"] } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('"tag:p" is specified as parent but not exists');
    });

    test("implicitParentsだけを入れて登録する", async () => {
      const parentResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "p" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: parentTag } = parentResult! as { tag: Tag };

      const registerResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", implicitParents: [`tag:${parentTag.id}`] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(registerResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: registeredTag } = registerResult! as { tag: Tag };

      const parentRels = await ds.getRepository(TagParent).find({
        where: { parent: { id: parentTag.id }, child: { id: registeredTag.id } },
        relations: { parent: true, child: true },
      });
      expect(parentRels).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parentRel = parentRels.at(0)!;
      expect(parentRel).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          explicit: false,
          parent: expect.objectContaining({
            id: parentTag.id,
          }),
          child: expect.objectContaining({
            id: registeredTag.id,
          }),
        })
      );

      const findResult = await ds.getRepository(Tag).findOne({
        where: { id: registeredTag.id },
        relations: ["tagNames", "tagParents", "tagParents.parent", "tagParents.child"],
      });
      expect(findResult).toStrictEqual(
        expect.objectContaining({
          id: registeredTag.id,
          tagNames: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: "a",
              primary: true,
            }),
          ]),
          tagParents: expect.arrayContaining([
            expect.objectContaining({
              parent: expect.objectContaining({ id: parentTag.id }),
              child: expect.objectContaining({ id: registeredTag.id }),
              explicit: false,
            }),
          ]),
        })
      );
    });

    test("explicitParentとimplicitParentsに同じIDを入れるとエラー", async () => {
      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a", explicitParent: "tag:p", implicitParents: ["tag:p"] } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('"tag:p" is specified as explicitParent and also included in implicitParents');
    });

    test("implicitParentsに同じタグを複数回入れるとエラー", async () => {
      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a", implicitParents: ["tag:p", "tag:p"] } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('"tag:p" is included in implicitParents multiple times');
    });

    test("explicitParentとimplicitParentsを入れて登録する", async () => {
      const parentRegisterResult1 = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "p1" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: parentTag1 } = parentRegisterResult1! as { tag: Tag };

      const parentRegisterResult2 = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "p2" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: parentTag2 } = parentRegisterResult2! as { tag: Tag };

      const actualRegisterResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        {
          input: {
            primaryName: "a",
            explicitParent: `tag:${parentTag1.id}`,
            implicitParents: [`tag:${parentTag2.id}`],
          },
        },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(actualRegisterResult).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: actualTag } = actualRegisterResult! as { tag: Tag };

      const actualParentRels1 = await ds.getRepository(TagParent).find({
        where: { parent: { id: parentTag1.id }, child: { id: actualTag.id } },
        relations: { parent: true, child: true },
      });
      expect(actualParentRels1).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualParentRel1 = actualParentRels1.at(0)!;
      expect(actualParentRel1).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          explicit: true,
          parent: expect.objectContaining({
            id: parentTag1.id,
          }),
          child: expect.objectContaining({
            id: actualTag.id,
          }),
        })
      );

      const actualParentRels2 = await ds.getRepository(TagParent).find({
        where: { parent: { id: parentTag2.id }, child: { id: actualTag.id } },
        relations: { parent: true, child: true },
      });
      expect(actualParentRels2).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualParentRel2 = actualParentRels2.at(0)!;

      expect(actualParentRel2).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          explicit: false,
          parent: expect.objectContaining({
            id: parentTag2.id,
          }),
          child: expect.objectContaining({
            id: actualTag.id,
          }),
        })
      );

      const actualFindResult = await ds.getRepository(Tag).findOne({
        where: { id: actualTag.id },
        relations: {
          tagNames: true,
          tagParents: true,
        },
      });
      expect(actualFindResult).toStrictEqual(
        expect.objectContaining({
          id: actualTag.id,
        })
      );
    });

    test("bが既に存在して，b(a)を登録することは出来る", async () => {
      /* a */
      const resultTagA = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagA } = resultTagA as { tag: Tag };

      /* b */
      const resultTagB = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagB } = resultTagB as { tag: Tag };

      /* b(a) */
      const resultTagB_A = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b", explicitParent: `tag:${tagA.id}` } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(resultTagB_A).toBeDefined();
      const { tag: tagB_A } = resultTagB_A as { tag: Tag };

      const findResultNameByB = await ds.getRepository(Tag).find({
        where: { tagNames: { name: "b" } },
      });
      expect(findResultNameByB).toHaveLength(2);

      const findResultB_A = await ds.getRepository(Tag).findOne({
        where: { id: tagB_A.id },
        relations: ["tagNames", "tagParents", "tagParents.parent", "tagParents.child"],
      });
      expect(findResultB_A).toStrictEqual(
        expect.objectContaining({
          id: tagB_A.id,
          tagNames: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: "b",
              primary: true,
            }),
          ]),
          tagParents: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              explicit: true,
              parent: expect.objectContaining({
                id: tagA.id,
              }),
              child: expect.objectContaining({
                id: tagB_A.id,
              }),
            }),
          ]),
        })
      );
    });

    test("b(a)が既に存在するなら，bを登録することは出来ない", async () => {
      /* a */
      const resultTagA = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagA } = resultTagA as { tag: Tag };

      /* b(a) */
      const resultTagB_A = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b", explicitParent: `tag:${tagA.id}` } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(resultTagB_A).toBeDefined();
      const { tag: tagB_A } = resultTagB_A as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "b" } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "b" is reserved in "tag:${tagB_A.id}"`);
    });

    test("b(a)が既に存在するなら，b(a)を登録することは出来ない", async () => {
      /* a */
      const resultTagA = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagA } = resultTagA as { tag: Tag };

      /* b(a) */
      const resultTagB_A = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b", explicitParent: `tag:${tagA.id}` } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(resultTagB_A).toBeDefined();
      const { tag: tagB_A } = resultTagB_A as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          {
            input: {
              primaryName: "b",
              explicitParent: `tag:${tagA.id}`,
            },
          },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "b" with parent "tag:${tagA.id}" is already registered in "tag:${tagB_A.id}"`);
    });

    test("aを非明示的に親に持つb{a}が既に存在するなら，b(a)を登録することは出来ない", async () => {
      /* a/A */
      const resultTagA = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagA } = resultTagA as { tag: Tag };

      /* b{A} */
      const resultTagB_A = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b", implicitParents: [`tag:${tagA.id}`] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(resultTagB_A).toBeDefined();
      const { tag: tagB_A } = resultTagB_A as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          {
            input: {
              primaryName: "b",
              explicitParent: `tag:${tagA.id}`,
            },
          },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "b" with parent "tag:${tagA.id}" is already registered in "tag:${tagB_A.id}"`);
    });

    test("aを非明示的に親に持つb{a}が既に存在するなら，b{a}を登録することは出来ない", async () => {
      /* a/A */
      const resultTagA = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tag: tagA } = resultTagA as { tag: Tag };

      /* b{A} */
      const resultTagB_A = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "b", implicitParents: [`tag:${tagA.id}`] } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(resultTagB_A).toBeDefined();
      const { tag: tagB_A } = resultTagB_A as { tag: Tag };

      await expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          {
            input: {
              primaryName: "b",
              implicitParents: [`tag:${tagA.id}`],
            },
          },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError(`name "b" with parent "tag:${tagA.id}" is already registered in "tag:${tagB_A.id}"`);
    });
  });
});
