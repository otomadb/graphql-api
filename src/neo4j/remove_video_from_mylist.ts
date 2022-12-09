import { Driver } from "neo4j-driver";

export const removeVideoFromMylist =
  (driver: Driver) =>
  async ({ mylistId, videoId }: { mylistId: string; videoId: string }): Promise<void> => {
    const session = driver.session();

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
