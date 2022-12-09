import { Driver } from "neo4j-driver";

export const createMylist =
  (driver: Driver) =>
  async ({ userId, mylistId }: { userId: string; mylistId: string }): Promise<void> => {
    const session = driver.session();

    try {
      await session.run(
        `
      MERGE (l:Mylist {id: "e"})
      MERGE (u:User {id: "a"})
      MERGE (u)-[r:HAS_MYLIST]->(l)
      RETURN r
      `,
        {
          mylist_id: mylistId,
          user_id: userId,
        }
      );
    } finally {
      await session.close();
    }
  };
