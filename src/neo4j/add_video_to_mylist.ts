import { neo4jDriver } from "./driver.js";

export const addVideoToMylist = async ({ mylistId, videoId }: { mylistId: string; videoId: string }): Promise<void> => {
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
