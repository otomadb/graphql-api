import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { entities } from "../../../db/entities.js";
import { TagName } from "../../../db/entities/tag_names.js";
import { TagParent } from "../../../db/entities/tag_parents.js";
import { Tag } from "../../../db/entities/tags.js";
import { migrations } from "../../../db/migrations.js";
import { SortOrder } from "../../../graphql.js";
import { findTags as findTagsScaffold } from "./findTags.js";

describe("with DB", () => {
  let dataSource: DataSource;
  let findTags: ReturnType<typeof findTagsScaffold>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      url: process.env.TEST_DATABASE_URL,
      entities,
      migrations, // [`${(resolve(dirname(new URL(import.meta.url).pathname)), "../db/migrations")}/*.ts`],
    });
    await dataSource.initialize();

    findTags = findTagsScaffold({ dataSource });
  });

  beforeEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  test("何もタグを登録していない", async () => {
    const { nodes } = await findTags({}, { input: { limit: 10, skip: 0, order: { updatedAt: SortOrder.Desc } } });
    expect(nodes).toStrictEqual([]);
  });

  test("inputにnameを入れて取得する", async () => {
    const tag = new Tag();
    tag.id = ulid();

    const name = new TagName();
    name.id = ulid();
    name.name = `name`;
    name.tag = tag;

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(tag);
      await manager.getRepository(TagName).insert(name);
    });

    const { nodes } = await findTags(
      {},
      {
        input: {
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
          name: "name",
        },
      }
    );
    expect(nodes).toHaveLength(1);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tag.id,
          meaningless: false,
        }),
      ])
    );
  });

  test("inputにnameを入れ，parentを区別せずに取得する", async () => {
    const tagIds = [ulid(), ulid(), ulid(), ulid()];

    const bctag = new Tag();
    bctag.id = tagIds[0];

    const bcname = new TagName();
    bcname.id = ulid();
    bcname.name = `child`;
    bcname.tag = bctag;

    const bptag = new Tag();
    bptag.id = ulid();

    const bpname = new TagName();
    bpname.id = ulid();
    bpname.name = `parent`;
    bpname.tag = bptag;

    const bpr = new TagParent();
    bpr.id = ulid();
    bpr.child = bctag;
    bpr.parent = bptag;

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(bctag);
      await manager.getRepository(TagName).insert(bcname);

      await manager.getRepository(Tag).insert(bptag);
      await manager.getRepository(TagName).insert(bpname);

      await manager.getRepository(TagParent).insert(bpr);
    });

    for (let i = 1; i <= 3; i++) {
      const ctag = new Tag();
      ctag.id = tagIds[i];

      const cname = new TagName();
      cname.id = ulid();
      cname.name = `child`;
      cname.tag = ctag;

      const ptag = new Tag();
      ptag.id = ulid();

      const pname = new TagName();
      pname.id = ulid();
      pname.name = `other parent ${i}`;
      pname.tag = ptag;

      const pr = new TagParent();
      pr.id = ulid();
      pr.child = ctag;
      pr.parent = ptag;

      await dataSource.transaction(async (manager) => {
        await manager.getRepository(Tag).insert(ctag);
        await manager.getRepository(TagName).insert(cname);

        await manager.getRepository(Tag).insert(ptag);
        await manager.getRepository(TagName).insert(pname);

        await manager.getRepository(TagParent).insert(pr);
      });
    }

    const { nodes } = await findTags(
      {},
      {
        input: {
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
          name: "child",
        },
      }
    );
    expect(nodes).toHaveLength(4);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tagIds[0],
          meaningless: false,
        }),
        expect.objectContaining({
          id: tagIds[1],
          meaningless: false,
        }),
        expect.objectContaining({
          id: tagIds[2],
          meaningless: false,
        }),
        expect.objectContaining({
          id: tagIds[3],
          meaningless: false,
        }),
      ])
    );
  });

  test("inputにnameを入れ，1つのparentを区別して取得する", async () => {
    const tagIds = [ulid(), ulid(), ulid(), ulid()];

    const bctag = new Tag();
    bctag.id = tagIds[0];

    const bcname = new TagName();
    bcname.id = ulid();
    bcname.name = `child`;
    bcname.tag = bctag;

    const bptag = new Tag();
    bptag.id = ulid();

    const bpname = new TagName();
    bpname.id = ulid();
    bpname.name = `parent`;
    bpname.tag = bptag;

    const bpr = new TagParent();
    bpr.id = ulid();
    bpr.child = bctag;
    bpr.parent = bptag;

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(bctag);
      await manager.getRepository(TagName).insert(bcname);

      await manager.getRepository(Tag).insert(bptag);
      await manager.getRepository(TagName).insert(bpname);

      await manager.getRepository(TagParent).insert(bpr);
    });

    for (let i = 1; i <= 3; i++) {
      const ctag = new Tag();
      ctag.id = tagIds[i];

      const cname = new TagName();
      cname.id = ulid();
      cname.name = `child`;
      cname.tag = ctag;

      const ptag = new Tag();
      ptag.id = ulid();

      const pname = new TagName();
      pname.id = ulid();
      pname.name = `other parent ${i}`;
      pname.tag = ptag;

      const pr = new TagParent();
      pr.id = ulid();
      pr.child = ctag;
      pr.parent = ptag;

      await dataSource.transaction(async (manager) => {
        await manager.getRepository(Tag).insert(ctag);
        await manager.getRepository(TagName).insert(cname);

        await manager.getRepository(Tag).insert(ptag);
        await manager.getRepository(TagName).insert(pname);

        await manager.getRepository(TagParent).insert(pr);
      });
    }

    const { nodes } = await findTags(
      {},
      {
        input: {
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
          name: "child",
          parents: [bptag.id],
        },
      }
    );
    expect(nodes).toHaveLength(1);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tagIds[0],
          meaningless: false,
        }),
      ])
    );
  });

  test("inputにnameを入れ，2つのparentを区別して取得する", async () => {
    const tagIds = [ulid(), ulid(), ulid(), ulid()];
    const ptagIds = [ulid(), ulid(), ulid(), ulid()];

    for (let i = 0; i < 4; i++) {
      const ctag = new Tag();
      ctag.id = tagIds[i];

      const cname = new TagName();
      cname.id = ulid();
      cname.name = `child`;
      cname.tag = ctag;

      const ptag = new Tag();
      ptag.id = ptagIds[i];

      const pname = new TagName();
      pname.id = ulid();
      pname.name = `other parent ${i}`;
      pname.tag = ptag;

      const pr = new TagParent();
      pr.id = ulid();
      pr.child = ctag;
      pr.parent = ptag;

      await dataSource.transaction(async (manager) => {
        await manager.getRepository(Tag).insert(ctag);
        await manager.getRepository(TagName).insert(cname);

        await manager.getRepository(Tag).insert(ptag);
        await manager.getRepository(TagName).insert(pname);

        await manager.getRepository(TagParent).insert(pr);
      });
    }

    const { nodes } = await findTags(
      {},
      {
        input: {
          limit: 10,
          skip: 0,
          order: { updatedAt: SortOrder.Desc },
          name: "child",
          parents: [ptagIds[0], ptagIds[1]],
        },
      }
    );
    expect(nodes).toHaveLength(2);
    expect(nodes).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tagIds[0],
          meaningless: false,
        }),
        expect.objectContaining({
          id: tagIds[1],
          meaningless: false,
        }),
      ])
    );
  });
});
