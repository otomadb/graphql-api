import { Driver, Integer } from "neo4j-driver";

export const calcMylistIncludeTags =
  (driver: Driver) =>
  async (mylistId: string, { limit }: { limit: number }): Promise<{ tagId: string; count: number }[]> => {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (:Mylist {id: $mylist_id})-[:CONTAINS_VIDEO]->(:Video)-[:TAGGED_BY]->(t:Tag)
        RETURN t.id AS id, count(t) AS c ORDER BY c DESC, id LIMIT $limit
        `,
        {
          mylist_id: mylistId,
          limit: Integer.fromNumber(limit),
        }
      );
      return result.records.map((rec) => ({
        tagId: rec.get("id"),
        count: rec.get("c").toNumber(),
      }));
    } finally {
      await session.close();
    }
  };
