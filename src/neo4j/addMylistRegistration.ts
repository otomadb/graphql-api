import { Driver as Neo4jDriver } from "neo4j-driver";

import { MylistRegistration } from "../db/entities/mylist_registrations.js";

export const addMylistRegistration =
  ({ neo4jDriver }: { neo4jDriver: Neo4jDriver }) =>
  async (rel: MylistRegistration) => {
    const mylistId = rel.mylist.id;
    const videoId = rel.video.id;

    const session = neo4jDriver.session();
    try {
      await session.run(
        `
        MERGE (l:Mylist {id: $mylist_id })
        MERGE (v:Video {id: $video_id })
        MERGE (l)-[r:CONTAINS_VIDEO]->(v)
        RETURN r
        `,
        { mylist_id: mylistId, video_id: videoId }
      );
    } finally {
      await session.close();
    }
  };
