import { neo4jDriver } from "./driver.js";

export const registerTag = async (tagId: string): Promise<void> => {
  const session = neo4jDriver.session();

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
