import { neo4jDriver } from "./driver.js";

export const createMylist = async ({ userId, mylistId }: { userId: string; mylistId: string }): Promise<void> => {
  const session = neo4jDriver.session();

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
