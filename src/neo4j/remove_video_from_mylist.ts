import { neo4jDriver } from "./driver.js";

export const removeVideoFromMylist = async ({
  mylistId,
  videoId,
}: {
  mylistId: string;
  videoId: string;
}): Promise<void> => {
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
