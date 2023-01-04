import { describe, jest, test } from "@jest/globals";
import { DataSource } from "typeorm";

import { Mylist, MylistShareRange } from "../../db/entities/mylists.js";
import { User } from "../../db/entities/users.js";
import { resolveUserLikes } from "./likes.js";
import { UserModel } from "./model.js";

describe("resolver User.likes", () => {
  test("MylistがPRIVATEで，認証していなければnull", async () => {
    const actual = await resolveUserLikes({
      dataSource: {
        getRepository: jest.fn().mockImplementation(() => ({
          findOne: jest.fn().mockReturnValue({
            id: "1",
            range: MylistShareRange.PRIVATE,
          } as Mylist),
        })),
      } as unknown as DataSource,
    })({ id: "1" } as UserModel, {}, { user: null });

    expect(actual).toStrictEqual(null);
  });

  test("MylistがPRIVATEで，parentのIDと認証ユーザのIDが違えばnull", async () => {
    const actual = await resolveUserLikes({
      dataSource: {
        getRepository: jest.fn().mockImplementation(() => ({
          findOne: jest.fn().mockReturnValue({
            id: "1",
            range: MylistShareRange.PRIVATE,
          } as Mylist),
        })),
      } as unknown as DataSource,
    })({ id: "1" } as UserModel, {}, { user: { id: "2" } as User });

    expect(actual).toStrictEqual(null);
  });

  test("MylistがKNOW_LINKで，認証していなければnull", async () => {
    const actual = await resolveUserLikes({
      dataSource: {
        getRepository: jest.fn().mockImplementation(() => ({
          findOne: jest.fn().mockReturnValue({
            id: "1",
            range: MylistShareRange.KNOW_LINK,
          } as Mylist),
        })),
      } as unknown as DataSource,
    })({ id: "1" } as UserModel, {}, { user: null });

    expect(actual).toStrictEqual(null);
  });

  test("MylistがKNOW_LINKで，parentのIDと認証ユーザのIDが違えばnull", async () => {
    const actual = await resolveUserLikes({
      dataSource: {
        getRepository: jest.fn().mockImplementation(() => ({
          findOne: jest.fn().mockReturnValue({
            id: "1",
            range: MylistShareRange.KNOW_LINK,
          } as Mylist),
        })),
      } as unknown as DataSource,
    })({ id: "1" } as UserModel, {}, { user: { id: "2" } as User });

    expect(actual).toStrictEqual(null);
  });
});
