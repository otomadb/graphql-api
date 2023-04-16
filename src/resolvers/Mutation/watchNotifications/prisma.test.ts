import { NotificationType, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { update } from "./prisma.js";

describe("Register tag parent relation in Prisma", () => {
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

  test("正常系", async () => {
    await prisma.$transaction([
      prisma.user.create({ data: { id: "u1" } }),
      prisma.notification.createMany({
        data: [
          {
            id: "n1",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
          {
            id: "n2",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
          {
            id: "n3",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
        ],
      }),
    ]);

    const actual = (await update(prisma, {
      authUserId: "u1",
      notificationIds: ["n1", "n2"],
    })) as ReturnOk<typeof update>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      notifications: [
        {
          id: "n1",
          isWatched: true,
          notifyToId: "u1",
          payload: {},
          type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: "n2",
          isWatched: true,
          notifyToId: "u1",
          payload: {},
          type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    } satisfies OkData<typeof actual>);

    const n3 = await prisma.notification.findUniqueOrThrow({ where: { id: "n3" } });
    expect(n3.isWatched).toBe(false);
  });

  test("IDに対しての通知が存在しない場合そのIDは無視する", async () => {
    await prisma.$transaction([
      prisma.user.create({ data: { id: "u1" } }),
      prisma.notification.createMany({
        data: [
          {
            id: "n1",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
          {
            id: "n2",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
        ],
      }),
    ]);

    const actual = (await update(prisma, {
      authUserId: "u1",
      notificationIds: ["n1", "n2", "n3"],
    })) as ReturnOk<typeof update>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      notifications: [
        {
          id: "n1",
          isWatched: true,
          notifyToId: "u1",
          payload: {},
          type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: "n2",
          isWatched: true,
          notifyToId: "u1",
          payload: {},
          type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    } satisfies OkData<typeof actual>);
  });

  test("通知先が違う通知を見ようとするとエラー", async () => {
    await prisma.$transaction([
      prisma.user.createMany({ data: [{ id: "u1" }, { id: "u2" }] }),
      prisma.notification.createMany({
        data: [
          {
            id: "n1",
            notifyToId: "u1",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
          {
            id: "n2",
            notifyToId: "u2",
            payload: {},
            type: NotificationType.ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST,
            isWatched: false,
          },
        ],
      }),
    ]);

    const actual = (await update(prisma, {
      authUserId: "u1",
      notificationIds: ["n1", "n2"],
    })) as ReturnErr<typeof update>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      type: "WRONG_NOTIFYTO",
      actualNotifyToId: "u2",
      notificationId: "n2",
    } satisfies ErrError<typeof actual>);
  });
});
