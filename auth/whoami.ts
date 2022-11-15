import { Database } from "mongo/mod.ts";
import { MongoError } from "mongo/src/error.ts";
import { RouterMiddleware } from "oak/mod.ts";
import { getUsersCollections } from "~/collections.ts";

export const routeWhoAmI = (db: Database): RouterMiddleware<"/whoami"> => async ({ state, response }) => {
  const { userId } = state;
  if (!userId) {
    response.status = 500;
    return;
  }

  const usersColl = getUsersCollections(db);

  try {
    const dbUser = await usersColl.findOne({ _id: userId }, {
      projection: { "name": true, "display_name": true },
    });

    if (!dbUser) {
      response.status = 404;
      return;
    }
    const { name, display_name } = dbUser;
    response.body = { name, displayName: display_name };
    return;
  } catch (e) {
    if (e instanceof MongoError) {
      response.status = 500;
      return;
    } else {
      response.status = 500;
      return;
    }
  }
};
