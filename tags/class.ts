import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagHistoryCollection, getVideosCollection } from "~/common/collections.ts";
import { Video } from "~/videos/mod.ts";
import {
  TagAddNameHistoryItem,
  TagChangePrimaryNameHistoryItem,
  TagDeleteNameHistoryItem,
  TagRegisterHistoryItem,
} from "./history_item_class.ts";

export class Tag {
  protected id;
  protected type;
  private _names;

  constructor({ id, names, type }: {
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
  }) {
    this.id = id;
    this._names = names;
    this.type = type;
  }

  names() {
    return this._names.map((v) => new TagName(v));
  }

  name() {
    const name = this.names().find((v) => v.primary());
    if (!name) {
      throw new GraphQLError("no primary title");
    }
    return name.name();
  }

  async history(_: unknown, context: { mongo: MongoClient }) {
    const taghistColls = getTagHistoryCollection(context.mongo);
    const items = await taghistColls.find(
      { tag_id: this.id },
      { sort: { "created_at": -1 } },
    ).toArray();
    return items.map(
      (item) => {
        switch (item.type) {
          case "REGISTER": {
            const { _id, created_at, tag_id, user_id } = item;
            return new TagRegisterHistoryItem({
              id: _id,
              userId: user_id,
              tagId: tag_id,
              createdAt: created_at,
            });
          }
          case "ADD_NAME": {
            const { _id, created_at, tag_id, user_id, name } = item;
            return new TagAddNameHistoryItem({
              id: _id,
              userId: user_id,
              tagId: tag_id,
              createdAt: created_at,
              name,
            });
          }
          case "DELETE_NAME": {
            const { _id, created_at, tag_id, user_id, name } = item;
            return new TagDeleteNameHistoryItem({
              id: _id,
              userId: user_id,
              tagId: tag_id,
              createdAt: created_at,
              name,
            });
          }
          case "CHANGE_PRIMARY_NAME": {
            const { _id, created_at, tag_id, user_id, from, to } = item;
            return new TagChangePrimaryNameHistoryItem({
              id: _id,
              userId: user_id,
              tagId: tag_id,
              createdAt: created_at,
              from,
              to,
            });
          }
          default:
            throw new GraphQLError("something wrong");
        }
      },
    );
  }

  async taggedVideos(_: unknown, context: { mongo: MongoClient }) {
    const videosColl = getVideosCollection(context.mongo);
    return (await videosColl
      .find({ tags: this.id as unknown as string[] })
      .toArray())
      .map((v) =>
        new Video({
          id: v._id,
          tags: v.tags,
          thumbnails: v.thumbnails,
          titles: v.titles,
        })
      );
  }
}

export class TagName {
  private _name;
  private _primary;

  constructor({ name, primary }: { name: string; primary?: boolean }) {
    this._name = name;
    this._primary = primary;
  }

  name() {
    return this._name;
  }

  primary() {
    return !!this._primary;
  }
}

export class SearchTagsResultItem {
  matchedName;
  tag;

  constructor({ matchedName }: { matchedName: string }, tagPayload: ConstructorParameters<typeof Tag>[0]) {
    this.matchedName = matchedName;
    this.tag = new Tag(tagPayload);
  }
}
