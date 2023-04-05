import { PrismaClient } from "@prisma/client";
import { ulid } from "ulid";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../types.js";
import { getVideos } from "./prisma.js";

describe("Get whole videos in mylist group in prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("存在する全てのマイリストがグループの中にある", async () => {
    const videoId1 = "v1";
    const videoId2 = "v2";
    const videoId3 = "v3";

    const mylistId1 = "m1";
    const mylistId2 = "m2";
    const mylistId3 = "m3";

    const userId1 = "u1";

    const groupId1 = "g1";

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId1,
          name: "user1",
          displayName: "User1",
          email: "user1@example.com",
          password: "password",
        },
      }),
      prisma.video.createMany({
        data: [{ id: videoId1 }, { id: videoId2 }, { id: videoId3 }],
      }),
      prisma.mylist.createMany({
        data: [
          {
            id: mylistId1,
            title: "Mylist 1",
            holderId: userId1,
            slug: "mylist-1",
          },
          {
            id: mylistId2,
            title: "Mylist 2",
            holderId: userId1,
            slug: "mylist-2",
          },
          {
            id: mylistId3,
            title: "Mylist 3",
            holderId: userId1,
            slug: "mylist-3",
          },
        ],
      }),
      prisma.mylistRegistration.createMany({
        data: [
          { id: ulid(), mylistId: mylistId1, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId3 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId3, videoId: videoId1 },
        ],
      }),
      prisma.mylistGroup.create({
        data: {
          id: groupId1,
          title: "Group 1",
          holderId: userId1,
          mylists: {
            createMany: {
              data: [
                { id: ulid(), mylistId: mylistId1 },
                { id: ulid(), mylistId: mylistId2 },
                { id: ulid(), mylistId: mylistId3 },
              ],
            },
          },
        },
      }),
    ]);

    const actual = await getVideos(prisma, { groupId: groupId1, skip: 0, limit: 5 });
    expect(actual).toHaveLength(3);
    expect(actual).toStrictEqual([
      { videoId: videoId1, count: 3 },
      { videoId: videoId2, count: 2 },
      { videoId: videoId3, count: 1 },
    ]);
  });

  test("グループの中にないマイリストが存在する", async () => {
    const videoId1 = "v1";
    const videoId2 = "v2";
    const videoId3 = "v3";

    const mylistId1 = "m1";
    const mylistId2 = "m2";
    const mylistId3 = "m3";
    const mylistId4 = "m4";

    const userId1 = "u1";

    const groupId1 = "g1";

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId1,
          name: "user1",
          displayName: "User1",
          email: "user1@example.com",
          password: "password",
        },
      }),
      prisma.video.createMany({
        data: [{ id: videoId1 }, { id: videoId2 }, { id: videoId3 }],
      }),
      prisma.mylist.createMany({
        data: [
          {
            id: mylistId1,
            title: "Mylist 1",
            holderId: userId1,
            slug: "mylist-1",
          },
          {
            id: mylistId2,
            title: "Mylist 2",
            holderId: userId1,
            slug: "mylist-2",
          },
          {
            id: mylistId3,
            title: "Mylist 3",
            holderId: userId1,
            slug: "mylist-3",
          },
          {
            id: mylistId4,
            title: "Mylist 4",
            holderId: userId1,
            slug: "mylist-4",
          },
        ],
      }),
      prisma.mylistRegistration.createMany({
        data: [
          { id: ulid(), mylistId: mylistId1, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId3 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId3, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId4, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId4, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId4, videoId: videoId3 },
        ],
      }),
      prisma.mylistGroup.create({
        data: {
          id: groupId1,
          title: "Group 1",
          holderId: userId1,
          mylists: {
            createMany: {
              data: [
                { id: ulid(), mylistId: mylistId1 },
                { id: ulid(), mylistId: mylistId2 },
                { id: ulid(), mylistId: mylistId3 },
              ],
            },
          },
        },
      }),
    ]);

    const actual = await getVideos(prisma, { groupId: groupId1, skip: 0, limit: 5 });
    expect(actual).toHaveLength(3);
    expect(actual).toStrictEqual([
      { videoId: videoId1, count: 3 },
      { videoId: videoId2, count: 2 },
      { videoId: videoId3, count: 1 },
    ]);
  });

  test("グループの中のマイリストに含まれない動画が存在する", async () => {
    const videoId1 = "v1";
    const videoId2 = "v2";
    const videoId3 = "v3";
    const videoId4 = "v4";

    const mylistId1 = "m1";
    const mylistId2 = "m2";
    const mylistId3 = "m3";

    const userId1 = "u1";

    const groupId1 = "g1";

    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId1,
          name: "user1",
          displayName: "User1",
          email: "user1@example.com",
          password: "password",
        },
      }),
      prisma.video.createMany({
        data: [{ id: videoId1 }, { id: videoId2 }, { id: videoId3 }, { id: videoId4 }],
      }),
      prisma.mylist.createMany({
        data: [
          {
            id: mylistId1,
            title: "Mylist 1",
            holderId: userId1,
            slug: "mylist-1",
          },
          {
            id: mylistId2,
            title: "Mylist 2",
            holderId: userId1,
            slug: "mylist-2",
          },
          {
            id: mylistId3,
            title: "Mylist 3",
            holderId: userId1,
            slug: "mylist-4",
          },
        ],
      }),
      prisma.mylistRegistration.createMany({
        data: [
          { id: ulid(), mylistId: mylistId1, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId1, videoId: videoId3 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId1 },
          { id: ulid(), mylistId: mylistId2, videoId: videoId2 },
          { id: ulid(), mylistId: mylistId3, videoId: videoId1 },
        ],
      }),
      prisma.mylistGroup.create({
        data: {
          id: groupId1,
          title: "Group 1",
          holderId: userId1,
          mylists: {
            createMany: {
              data: [
                { id: ulid(), mylistId: mylistId1 },
                { id: ulid(), mylistId: mylistId2 },
                { id: ulid(), mylistId: mylistId3 },
              ],
            },
          },
        },
      }),
    ]);

    const actual = await getVideos(prisma, { groupId: groupId1, skip: 0, limit: 5 });
    expect(actual).toHaveLength(3);
    expect(actual).toStrictEqual([
      { videoId: videoId1, count: 3 },
      { videoId: videoId2, count: 2 },
      { videoId: videoId3, count: 1 },
    ]);
  });
});
