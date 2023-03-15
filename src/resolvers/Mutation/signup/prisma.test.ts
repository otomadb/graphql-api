import { PrismaClient, UserRole } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { registerNewUser } from "./prisma.js";

describe("Register user in Prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("既に同じnameが登録済み", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
          name: "testuser",
          displayName: "Test User",
          email: "testuser@example.net",
          isEmailConfirmed: true,
          password: "password",
          role: UserRole.NORMAL,
        },
      }),
    ]);

    const actual = (await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User 2",
      email: "testuser2@example.net",
      password: "password",
    })) as ReturnErr<typeof registerNewUser>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      message: "NAME_ALREADY_EXISTS",
      name: "testuser",
    } satisfies ErrError<typeof actual>);
  });

  test.each(["---", "   test"])(`不適当なname: %s`, async (email) => {
    const actual = (await registerNewUser(prisma, {
      name: email,
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    })) as ReturnErr<typeof registerNewUser>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      message: "NAME_WRONG_CHARACTER",
      name: email,
    } satisfies ErrError<typeof actual>);
  });

  test("既に同じemailが登録済み", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
          name: "testuser",
          displayName: "Test User",
          email: "testuser@example.net",
          isEmailConfirmed: true,
          password: "password",
          role: UserRole.NORMAL,
        },
      }),
    ]);

    const actual = (await registerNewUser(prisma, {
      name: "testuser2",
      displayName: "Test User 2",
      email: "testuser@example.net",
      password: "password",
    })) as ReturnErr<typeof registerNewUser>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      message: "EMAIL_ALREADY_EXISTS",
      email: "testuser@example.net",
    } satisfies ErrError<typeof actual>);
  });

  test.each(["example.com"])(`不適当なemail: %s`, async (email) => {
    const actual = (await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email,
      password: "password",
    })) as ReturnErr<typeof registerNewUser>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toStrictEqual({
      message: "EMAIL_INVALID_EMAIL_FORMAT",
      email,
    } satisfies ErrError<typeof actual>);
  });

  test("管理者が存在しないなら，管理者ユーザとして作成される", async () => {
    const actual = (await registerNewUser(prisma, {
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      password: "password",
    })) as ReturnOk<typeof registerNewUser>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      id: expect.any(String),
      name: "testuser",
      displayName: "Test User",
      email: "testuser@example.net",
      isEmailConfirmed: false,
      password: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      icon: null,
      role: UserRole.ADMINISTRATOR,
    } satisfies OkData<typeof actual>);
  });

  test("管理者が存在するなら，通常ユーザとして作成される", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
          name: "testuser",
          displayName: "Test User",
          email: "testuser@example.net",
          isEmailConfirmed: true,
          password: "password",
          role: UserRole.ADMINISTRATOR,
        },
      }),
    ]);

    const actual = (await registerNewUser(prisma, {
      name: "testuser2",
      displayName: "Test User 2",
      email: "testuser2@example.net",
      password: "password",
    })) as ReturnOk<typeof registerNewUser>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual({
      id: expect.any(String),
      name: "testuser2",
      displayName: "Test User 2",
      email: "testuser2@example.net",
      isEmailConfirmed: false,
      password: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      icon: null,
      role: UserRole.NORMAL,
    } satisfies OkData<typeof actual>);
  });
});
