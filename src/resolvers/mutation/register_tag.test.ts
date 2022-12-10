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
    [
      "a",
      [],
      null,
      ["2"],
      [
        { name: "a", parent: null },
        { name: "a", parent: "2" },
      ],
    ],
  ])("calcNameParentPair() %#", (primaryName, extraNames, explicitParent, implicitParents, expected) => {
    const actual = calcNameParentPair({
      primaryName,
      extraNames,
      explicitParent,
      implicitParents,
    });

    expect(actual.length).toBe(expected.length);
    expect(actual).toEqual(expect.arrayContaining(expected));
  });

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
      const actual = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(actual).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag } = actual!;
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

    test("primaryNameが既に重複しているとエラー", async () => {
      /* already */
      await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );

      expect(
        registerTag({ dataSource: ds, neo4jDriver })?.(
          {},
          { input: { primaryName: "a" } },
          {} as Context,
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('"a" is already registered');
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

    test("explicitParentを入れて登録する", async () => {
      const parentResult = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "p" } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag: parentTag } = parentResult! as { tag: Tag };

      const actual = await registerTag({ dataSource: ds, neo4jDriver })?.(
        {},
        { input: { primaryName: "a", explicitParent: `tag:${parentTag.id}` } },
        {} as Context,
        {} as GraphQLResolveInfo
      );
      expect(actual).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { tag } = actual! as { tag: Tag };

      const actualParentRels = await ds.getRepository(TagParent).find({
        where: { parent: { id: parentTag.id }, child: { id: tag.id } },
        relations: { parent: true, child: true },
      });
      expect(actualParentRels).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actualParentRel = actualParentRels.at(0)!;
      expect(actualParentRel).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          explicit: true,
          parent: expect.objectContaining({
            id: parentTag.id,
          }),
          child: expect.objectContaining({
            id: tag.id,
          }),
        })
      );
    });
  });
});
