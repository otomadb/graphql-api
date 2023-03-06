import { serialize as serializeCookie } from "cookie";

import { createSession } from "../../../auth/session.js";
import {
  MutationResolvers,
  SignupDisplayNameValidationError,
  SignupDisplayValidationNameErrorEnum,
  SignupEmailAlreadyExistsError,
  SignupEmailValidationError,
  SignupEmailValidationErrorEnum,
  SignupNameAlreadyExistsError,
  SignupNameValidationError,
  SignupNameValidationErrorEnum,
  SignupOtherErrorsFallback,
  SignupOtherErrorsFallbackEnum,
  SignupPasswordValidationError,
  SignupPasswordValidationErrorEnum,
} from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";
import { registerNewUser } from "./prisma.js";

export const resolverSignup = ({ prisma, config, logger }: Pick<ResolverDeps, "prisma" | "config" | "logger">) =>
  (async (_parent, { input: { name, displayName, email, password: rawPassword } }, { res }, info) => {
    const result = await registerNewUser(prisma, { name, displayName, email, password: rawPassword });
    if (isErr(result)) {
      switch (result.error.message) {
        case "NAME_ALREADY_EXISTS":
          return {
            __typename: "SignupNameAlreadyExistsError",
            name: result.error.name,
          } satisfies SignupNameAlreadyExistsError;
        case "NAME_INSUFFICIENT_MIN_LENGTH":
          return {
            __typename: "SignupNameValidationError",
            name: result.error.name,
            enum: SignupNameValidationErrorEnum.InsufficientMinLength,
          } satisfies SignupNameValidationError;
        case "NAME_INSUFFICIENT_MAX_LENGTH":
          return {
            __typename: "SignupNameValidationError",
            name: result.error.name,
            enum: SignupNameValidationErrorEnum.InsufficientMaxLength,
          } satisfies SignupNameValidationError;
        case "NAME_WRONG_CHARACTER":
          return {
            __typename: "SignupNameValidationError",
            name: result.error.name,
            enum: SignupNameValidationErrorEnum.WrongCharacter,
          } satisfies SignupNameValidationError;
        case "DISPLAY_NAME_INSUFFICIENT_MIN_LENGTH":
          return {
            __typename: "SignupDisplayNameValidationError",
            displayName: result.error.displayName,
            enum: SignupDisplayValidationNameErrorEnum.InsufficientMinLength,
          } satisfies SignupDisplayNameValidationError;
        case "DISPLAY_NAME_INSUFFICIENT_MAX_LENGTH":
          return {
            __typename: "SignupDisplayNameValidationError",
            displayName: result.error.displayName,
            enum: SignupDisplayValidationNameErrorEnum.InsufficientMaxLength,
          } satisfies SignupDisplayNameValidationError;
        case "EMAIL_ALREADY_EXISTS":
          return {
            __typename: "SignupEmailAlreadyExistsError",
            email: result.error.email,
          } satisfies SignupEmailAlreadyExistsError;
        case "EMAIL_INVALID_EMAIL_FORMAT":
          return {
            __typename: "SignupEmailValidationError",
            email: result.error.email,
            enum: SignupEmailValidationErrorEnum.InvalidEmailFormat,
          } satisfies SignupEmailValidationError;
        case "PASSWORD_INSUFFICIENT_MIN_LENGTH":
          return {
            __typename: "SignupPasswordValidationError",
            enum: SignupPasswordValidationErrorEnum.InsufficientMinLength,
          } satisfies SignupPasswordValidationError;
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "SignupOtherErrorsFallback",
            enum: SignupOtherErrorsFallbackEnum.InternalServerError,
          } satisfies SignupOtherErrorsFallback;
      }
    }

    const newUser = result.data;
    const session = await createSession(prisma, newUser.id);

    res.setHeader(
      "Set-Cookie",
      serializeCookie(config.session.cookieName(), session, {
        domain: config.session.cookieDomain(),
        httpOnly: true,
        secure: true,
        sameSite: config.session.cookieSameSite(),
        path: "/",
      })
    );

    return {
      __typename: "SignupSucceededPayload",
      user: new UserModel(newUser),
    };
  }) satisfies MutationResolvers["signup"];
