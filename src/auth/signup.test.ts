import { describe, jest, test } from "@jest/globals";
import { DataSource } from "typeorm";

import { User, UserRole } from "../db/entities/users.js";
import { registerUser } from "./signup.js";

describe("registerUser()", () => {
  test("既に同じnameを持つユーザがいるならエラーを返却", async () => {
    const mockFindOne = jest.fn().mockReturnValueOnce({ id: "1" } as User);

    const mock = {
      getRepository: jest.fn().mockImplementation(() => ({ findOneBy: mockFindOne })),
      transaction: jest.fn().mockImplementation(() => ({})),
    } as unknown as DataSource;

    const actual = await registerUser(mock, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "error",
      error: { message: "USER_NAME_ALREADY_REGISTERED" },
    });
  });

  test("管理者が存在しないなら，管理者ユーザとして作成される", async () => {
    const mockFindOne = jest
      .fn()
      .mockReturnValueOnce(null) // by name
      .mockReturnValueOnce(null); // by admin role
    const mockTransaction = jest.fn();

    const mock = {
      getRepository: jest.fn().mockImplementation(() => ({ findOneBy: mockFindOne })),
      transaction: mockTransaction,
    } as unknown as DataSource;

    const actual = await registerUser(mock, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: {
        user: expect.objectContaining({
          id: expect.any(String),
          name: "testuser",
          displayName: "Test User",
          email: "testuser@example.net",
          password: expect.any(String),
          icon: null,
          emailConfirmed: true,
          role: UserRole.ADMINISTRATOR,
        }),
      },
    });
  });

  test("管理者が存在するなら，通常ユーザとして作成される", async () => {
    const mockFindOne = jest
      .fn()
      .mockReturnValueOnce(null) // by name
      .mockReturnValueOnce({ id: "1" } as User); // by admin role
    const mockTransaction = jest.fn();

    const mock = {
      getRepository: jest.fn().mockImplementation(() => ({ findOneBy: mockFindOne })),
      transaction: mockTransaction,
    } as unknown as DataSource;

    const actual = await registerUser(mock, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    });

    expect(actual).toStrictEqual({
      status: "ok",
      data: {
        user: expect.objectContaining({
          id: expect.any(String),
          name: "testuser",
          displayName: "Test User",
          email: "testuser@example.net",
          password: expect.any(String),
          icon: null,
          emailConfirmed: true,
          role: UserRole.NORMAL,
        }),
      },
    });
  });
});
