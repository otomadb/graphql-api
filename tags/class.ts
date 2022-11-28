import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import { getTagHistoryCollection, getTagsCollection, getVideosCollection } from "../common/collections.js";
import { Video } from "../videos/mod.js";
import {
  TagAddNameHistoryItem,
  TagChangePrimaryNameHistoryItem,
  TagDeleteNameHistoryItem,
  TagRegisterHistoryItem,
} from "./history_item_class.js";

export class TagParent {
  private id;
  public explicit;

  constructor({ id, explicit }: { id: string; explicit: boolean }) {
    this.id = id;
    this.explicit = explicit;
  }

  async tag(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Tag> {
    const tagsColl = getTagsCollection(mongo);

    const tag = await tagsColl.findOne({ _id: this.id });
    if (!tag) throw new GraphQLError("no tag found");

    return new Tag({
      id: tag._id,
      names: tag.names,
      type: tag.type,
      parents: tag.parents || [],
    });
  }
}

export class Tag {
  public id;
  public type;
  private _names;
  private _parents: { id: string; explicit: boolean }[];

  constructor({ id, names, type, parents }: {
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
    parents: { id: string; explicit: boolean }[];
  }) {
    this.id = id;
    this._names = names;
    this.type = type;
    this._parents = parents;
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

  parents(): TagParent[] {
    return this._parents
      .sort(({ id: a }, { id: b }) => b < a ? -1 : 1)
      .map(({ id, explicit }) => new TagParent({ id, explicit }));
  }

  async explicitParent(args: unknown, ctx: { mongo: MongoClient }) {
    const exp = this.parents().find(({ explicit }) => explicit);
    if (!exp) return null;
    return await exp.tag(args, ctx);
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
