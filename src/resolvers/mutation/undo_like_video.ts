import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { MylistModel, VideoModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const undoLikeVideo =
  ({ dataSource: ds }: { dataSource: DataSource }): MutationResolvers["undoLikeVideo"] =>
  async (_, { input: { videoId } }, { user }) => {
    if (!user) {
      throw new GraphQLError("required to sign in");
    }

    const repository = ds.getRepository(MylistRegistration);
    const registration = await repository.findOne({
      where: {
        video: { id: removeIDPrefix(ObjectType.Video, videoId) },
        mylist: { holder: { id: user.id }, isLikeList: true },
      },
      relations: {
        video: true,
        mylist: true,
      },
    });
    if (!registration) throw new GraphQLError("Not Found");

    await repository.remove(registration);

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  };
