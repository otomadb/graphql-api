import { Driver } from "neo4j-driver";

export const registerTag =
  (driver: Driver) =>
  async (tagId: string): Promise<void> => {
    const session = driver.session();

    try {
      const result = await session.run(
        `
      MERGE (t:Tag {id: $tag_id})
      RETURN t.id AS id
      `,
        { tag_id: tagId }
      );
      // return result.records.map((rec) => ({ id: rec.get("id") }));
    } finally {
      await session.close();
    }
  };
