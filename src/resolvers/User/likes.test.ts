import { describe } from "@jest/globals";
import { Mylist, MylistShareRange, PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

import { ContextUser } from "../context.js";
import { resolveUserLikes } from "./likes.js";
import { UserModel } from "./model.js";

describe("resolver User.likes", () => {
  test("MylistがPRIVATEで，認証していなければnull", async () => {
    const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
    prismaMock.mylist.findFirstOrThrow.mockResolvedValueOnce({
      shareRange: MylistShareRange.PRIVATE,
      holderId: "1",
    } as Mylist);

    const actual = await resolveUserLikes({ prisma: prismaMock })(
      { id: "1" } as UserModel,
      {},
      {
        user: null,
      }
    );

    expect(actual).toStrictEqual(null);
  });

  test("MylistがPRIVATEで，parentのIDと認証ユーザのIDが違えばnull", async () => {
    const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
    prismaMock.mylist.findFirstOrThrow.mockResolvedValueOnce({
      shareRange: MylistShareRange.PRIVATE,
      holderId: "1",
    } as Mylist);

    const actual = await resolveUserLikes({ prisma: prismaMock })(
      { id: "1" } as UserModel,
      {},
      {
        user: { id: "2" } as ContextUser,
      }
    );

    expect(actual).toStrictEqual(null);
  });

  test("MylistがKNOW_LINKで，認証していなければnull", async () => {
    const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
    prismaMock.mylist.findFirstOrThrow.mockResolvedValueOnce({
      shareRange: MylistShareRange.KNOW_LINK,
      holderId: "1",
    } as Mylist);

    const actual = await resolveUserLikes({ prisma: prismaMock })(
      { id: "1" } as UserModel,
      {},
      {
        user: { id: "2" } as ContextUser,
      }
    );

    expect(actual).toStrictEqual(null);
  });

  test("MylistがKNOW_LINKで，parentのIDと認証ユーザのIDが違えばnull", async () => {
    const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();
    prismaMock.mylist.findFirstOrThrow.mockResolvedValueOnce({
      shareRange: MylistShareRange.KNOW_LINK,
      holderId: "1",
    } as Mylist);

    const actual = await resolveUserLikes({ prisma: prismaMock })(
      { id: "1" } as UserModel,
      {},
      {
        user: { id: "2" } as ContextUser,
      }
    );

    expect(actual).toStrictEqual(null);
  });
});
