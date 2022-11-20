import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getVideosCollection } from "~/common/collections.ts";
import { Video } from "./class.ts";

export class SearchVideosResultItem {
  matchedTitle;
  video;

  constructor({ matchedTitle }: { matchedTitle: string }, videoPayload: ConstructorParameters<typeof Video>[0]) {
    this.matchedTitle = matchedTitle;
    this.video = new Video(videoPayload);
  }
}

export const searchVideos = async (
  args: { query: string; limit: number; skip: number },
  context: { mongo: MongoClient },
) => {
  const videosColl = getVideosCollection(context.mongo);
  const matched = await videosColl
    .aggregate<{
      matched_title: string;
      id: string;
      titles: { title: string; primary?: boolean }[];
      tags: string[];
      history: ObjectId[];
    }>([
      {
        $project: {
          _id: true,
          titles: true,
          titles_search: "$titles",
          tags: true,
          history: true,
        },
      },
      { $unwind: { path: "$titles_search" } },
      { $match: { "titles_search.title": { "$regex": args.query } } },
      {
        $sort: {
          "titles_search.primary": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          titles: { $first: "$titles" },
          tags: { $first: "$tags" },
          history: { $first: "$history" },
          matched_title: { $first: "$titles_search.title" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          titles: true,
          tags: true,
          history: true,
          matched_title: true,
        },
      },
      { $skip: args.skip },
      { $limit: args.limit },
    ])
    .toArray()
    .then((arr) =>
      arr.map(({ matched_title, ...rest }) =>
        new SearchVideosResultItem(
          { matchedTitle: matched_title },
          rest,
        )
      )
    );

  return {
    result: matched,
  };
};
