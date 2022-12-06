import { readFile } from "node:fs/promises";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphql } from "graphql";
import { ulid } from "ulid";
import { z, ZodType } from "zod";

import { Context } from "../context.js";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";
import { resolvers } from "../resolvers/index.js";

export const typeDefs = await readFile(new URL("../../schema.gql", import.meta.url), { encoding: "utf-8" });

await dataSource.initialize();
const schema = makeExecutableSchema({ typeDefs, resolvers });

const user = new User();
user.id = ulid();
user.name = `TestUser_${user.id}`;
user.displayName = user.name;
user.email = `${user.id}@example.com`;
user.password = "fakeuser";
user.icon = "";

await dataSource.getRepository(User).insert(user);

export async function runGraphQLQuery<T extends ZodType>(
  zType: T,
  source: string,
  variableValues: any,
  loggedIn = true
): Promise<z.infer<T>> {
  const res = await graphql({
    contextValue: { user: loggedIn ? user : null } as Context,
    source,
    schema,
    variableValues,
  });
  try {
    return zType.parse(res);
  } catch (e) {
    console.error(JSON.stringify(res, null, 4));
    throw e;
  }
}

const zCreateTagRes = z.object({
  data: z.object({
    registerTag: z.object({
      tag: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const queryForRegisterTag = `mutation ($input: RegisterTagInput!) {
    registerTag(input: $input) {
        tag {
            id
        }
    }
}`;

const createParentTag = await runGraphQLQuery(zCreateTagRes, queryForRegisterTag, {
  input: {
    primaryName: "東方",
    extraNames: ["Touhou"],
  },
});

const createTag = await runGraphQLQuery(zCreateTagRes, queryForRegisterTag, {
  input: {
    primaryName: "U.N.オーエンは彼女なのか？",
    extraNames: ["U.N. Owen Was Her?"],
    explicitParent: createParentTag.data.registerTag.tag.id,
  },
}).then((r) => zCreateTagRes.parse(r));

const queryForRegisterVideo = `mutation ($input: RegisterVideoInput!) {
    registerVideo(input: $input) {
        video {
            id
        }
    }
}`;
const zCreateVideoRes = z.object({
  data: z.object({
    registerVideo: z.object({
      video: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const createVideo = await runGraphQLQuery(zCreateVideoRes, queryForRegisterVideo, {
  input: {
    primaryTitle: "M.C.ドナルドはダンスに夢中なのか？最終鬼畜道化師ドナルド・Ｍ",
    extraTitles: ["Ronald McDonald insanity"],
    tags: [createTag.data.registerTag.tag.id],
    primaryThumbnail:
      "https://img.cdn.nimg.jp/s/nicovideo/thumbnails/2057168/2057168.original/r1280x720l?key=64c3379f18890e6747830c596be0a7276dab4e0fe574a98671b3b0c58c1f54c8",
    sources: [
      {
        type: "NICOVIDEO",
        sourceId: "sm2057168",
      },
    ],
  },
});

const queryForCreateMylist = `mutation($input: CreateMylistInput!) {
    createMylist(input: $input) {
        mylist {
            id
        }
    }
}`;

const zCreateMylistRes = z.object({
  data: z.object({
    createMylist: z.object({
      mylist: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const createPublicMylist = await runGraphQLQuery(zCreateMylistRes, queryForCreateMylist, {
  input: {
    title: "Public Mylist",
    range: "PUBLIC",
  },
});

const createKnowLinkMylist = await runGraphQLQuery(zCreateMylistRes, queryForCreateMylist, {
  input: {
    title: "KnowLink Mylist",
    range: "KNOW_LINK",
  },
});

const createPrivateMylist = await runGraphQLQuery(zCreateMylistRes, queryForCreateMylist, {
  input: {
    title: "Private Mylist",
    range: "PRIVATE",
  },
});

const queryForGetMylist = `query($id: ID!) {
    mylist(id: $id) {
        id
    }
}`;

const zGetMylistRes = z.object({
  data: z.object({
    mylist: z.object({
      id: z.string(),
    }),
  }),
});

await runGraphQLQuery(zGetMylistRes, queryForGetMylist, { id: createPublicMylist.data.createMylist.mylist.id });
await runGraphQLQuery(zGetMylistRes, queryForGetMylist, { id: createKnowLinkMylist.data.createMylist.mylist.id });
await runGraphQLQuery(zGetMylistRes, queryForGetMylist, { id: createPrivateMylist.data.createMylist.mylist.id });
await runGraphQLQuery(zGetMylistRes, queryForGetMylist, { id: createPublicMylist.data.createMylist.mylist.id }, false);
await runGraphQLQuery(
  zGetMylistRes,
  queryForGetMylist,
  { id: createKnowLinkMylist.data.createMylist.mylist.id },
  false
);
await runGraphQLQuery(
  z.object({
    errors: z.array(
      z.object({
        message: z.literal("Mylist Not Found or Private"),
      })
    ),
    data: z.null(),
  }),
  queryForGetMylist,
  { id: createPrivateMylist.data.createMylist.mylist.id },
  false
);

const queryForAddVideoToMylist = `mutation($input: AddVideoToMylistInput!) {
    addVideoToMylist(input: $input) {
        id
        registration {
            id
        }
    }
}`;

const zAddVideoToMyListRes = z.object({
  data: z.object({
    addVideoToMylist: z.object({
      id: z.string(),
      registration: z.object({
        id: z.string(),
      }),
    }),
  }),
});

const addedMylistRegist = await runGraphQLQuery(zAddVideoToMyListRes, queryForAddVideoToMylist, {
  input: {
    videoId: createVideo.data.registerVideo.video.id,
    mylistId: createPublicMylist.data.createMylist.mylist.id,
    note: "a note",
  },
});

const queryForCheckRegistsOnMylist = `query($id: ID!) {
  mylist(id: $id) {
    registrations(input: {}) {
      nodes {
        id
      }
    }
  }
}`;
await runGraphQLQuery(
  z.object({
    data: z.object({
      mylist: z.object({
        registrations: z.object({
          nodes: z.array(
            z.object({
              id: z.literal(addedMylistRegist.data.addVideoToMylist.registration.id),
            })
          ),
        }),
      }),
    }),
  }),
  queryForCheckRegistsOnMylist,
  {
    id: createPublicMylist.data.createMylist.mylist.id,
  }
);

await dataSource.destroy();
