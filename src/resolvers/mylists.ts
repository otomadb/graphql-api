import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { Mylist, MylistShareRange as MylistEntityShareRange } from "../db/entities/mylists.js";
import { MutationResolvers, MylistShareRange as MylistGQLShareRange, QueryResolvers } from "../graphql/resolvers.js";
import { MylistModel } from "../models/mylist.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";
import { ulid } from "ulid";
import { MylistRegistration } from "../db/entities/mylist_registrations.js";
import { Video } from "../db/entities/videos.js";
import { MylistRegistrationModel } from "../models/mylist_registration.js";

const MYLIST_NOT_FOUND_OR_PRIVATE_ERROR = "Mylist Not Found or Private";
const MYLIST_NOT_HOLDED_BY_YOU = "This mylist is not holded by you";

export const mylist: QueryResolvers["mylist"] = async (_parent, { id }, { user }, _info) => {
  const mylist = await dataSource.getRepository(Mylist).findOne({
    where: {
      id: removeIDPrefix(ObjectType.Mylist, id),
      isLikeList: false,
    },
    relations: {
      holder: true,
    },
  });

  if (mylist == null) throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
  if (mylist.holder.id !== user?.id && mylist.range === MylistEntityShareRange.PRIVATE) {
    throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
  }

  return new MylistModel(mylist);
};

export const createMylist: MutationResolvers["createMylist"] = async (_parent, { input }, { user }, _info) => {
  if (user == null) throw new GraphQLError("need to authenticate");
  const mylist = new Mylist();
  mylist.id = ulid();
  mylist.title = input.title;
  if (input.range === MylistGQLShareRange.Public) {
    mylist.range = MylistEntityShareRange.PUBLIC;
  } else if (input.range === MylistGQLShareRange.KnowLink) {
    mylist.range = MylistEntityShareRange.KNOW_LINK;
  } else if (input.range === MylistGQLShareRange.Private) {
    mylist.range = MylistEntityShareRange.PRIVATE;
  } else {
    throw new GraphQLError("unknown share range");
  }
  mylist.holder = user;
  mylist.isLikeList = false;

  await dataSource.getRepository(Mylist).insert(mylist);

  return {
    mylist: new MylistModel(mylist),
  };
};

export const addVideoToMylist: MutationResolvers["addVideoToMylist"] = async (_parent, { input }, { user }, _info) => {
  if (user == null) throw new GraphQLError("need to authenticate");
  const mylist = await dataSource
    .getRepository(Mylist)
    .findOne({ where: { id: removeIDPrefix(ObjectType.Mylist, input.mylistId) }, relations: { holder: true } });
  if (mylist == null) {
    throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
  }
  if (mylist.holder.id != user.id) {
    if (mylist.range === MylistEntityShareRange.PRIVATE) {
      throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
    } else {
      throw new GraphQLError(MYLIST_NOT_HOLDED_BY_YOU);
    }
  }
  const video = await dataSource
    .getRepository(Video)
    .findOne({ where: { id: removeIDPrefix(ObjectType.Video, input.videoId) } });
  if (video == null) {
    throw new GraphQLError("Video not found");
  }
  const registration = new MylistRegistration();
  registration.id = ulid();
  registration.mylist = mylist;
  registration.video = video;
  registration.note = input.note ?? null;
  await dataSource.getRepository(MylistRegistration).insert(registration);

  return {
    id: registration.id,
    registration: new MylistRegistrationModel(registration),
  };
};
