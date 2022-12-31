import { Driver as Neo4jDriver } from "neo4j-driver";

import { MylistRegistration } from "../db/entities/mylist_registrations.js";

export const removeMylistRegistration =
  ({ neo4jDriver }: { neo4jDriver: Neo4jDriver }) =>
  async (rel: MylistRegistration) => {
    const mylistId = rel.mylist.id;
    const videoId = rel.video.id;

    const session = neo4jDriver.session();
    try {
      await session.run(
        `
        MATCH (l:Mylist {id: $mylist_id })
        MATCH (v:Video {id: $video_id })
        MATCH (l)-[r:CONTAINS_VIDEO]->(v)
        DELETE r
        `,
        { mylist_id: mylistId, video_id: videoId }
      );
    } finally {
      await session.close();
    }
  };
