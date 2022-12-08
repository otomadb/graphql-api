import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { MylistRegistrationModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { addVideoToMylist as addVideoToMylistInNeo4j } from "../../neo4j/add_video_to_mylist.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";
import { MYLIST_NOT_FOUND_OR_PRIVATE_ERROR, MYLIST_NOT_HOLDED_BY_YOU } from "../query/get_mylist.js";

export const addVideoToMylist =
  ({ dataSource }: { dataSource: DataSource }): MutationResolvers["addVideoToMylist"] =>
  async (_parent, { input }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");
    const mylist = await dataSource
      .getRepository(Mylist)
      .findOne({ where: { id: removeIDPrefix(ObjectType.Mylist, input.mylistId) }, relations: { holder: true } });
    if (!mylist) {
      throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
    }
    if (mylist.holder.id !== user.id) {
      if (mylist.range === MylistEntityShareRange.PRIVATE) {
        throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
      } else {
        throw new GraphQLError(MYLIST_NOT_HOLDED_BY_YOU);
      }
    }
    const video = await dataSource
      .getRepository(Video)
      .findOne({ where: { id: removeIDPrefix(ObjectType.Video, input.videoId) } });
    if (video === null) {
      throw new GraphQLError("Video not found");
    }
    const registration = new MylistRegistration();
    registration.id = ulid();
    registration.mylist = mylist;
    registration.video = video;
    registration.note = input.note ?? null;
    await dataSource.getRepository(MylistRegistration).insert(registration);

    await addVideoToMylistInNeo4j({
      mylistId: mylist.id,
      videoId: video.id,
    });

    return {
      registration: new MylistRegistrationModel({
        id: registration.id,
        note: registration.note,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
        mylistId: registration.mylist.id,
        videoId: registration.video.id,
      }),
    };
  };
