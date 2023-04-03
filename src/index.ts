// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-process-env */
import { createServer } from "node:http";

import { ResolveUserFn, useGenericAuth, ValidateUserFn } from "@envelop/generic-auth";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { PrismaClient, UserRole } from "@prisma/client";
import { ListValueNode, StringValueNode } from "graphql";
import { createSchema, createYoga, useLogger, useReadinessCheck } from "graphql-yoga";
import jwt, { GetPublicKeyOrSecret, Jwt } from "jsonwebtoken";
import createJwksClient from "jwks-rsa";
import { MeiliSearch } from "meilisearch";
import neo4j from "neo4j-driver";
import { pino } from "pino";

import { makeResolvers } from "./resolvers/index.js";
import { CurrentUser, ServerContext, UserContext } from "./resolvers/types.js";
import typeDefs from "./schema.graphql";
import { extractTokenFromReq, signToken } from "./token.js";
import { isOk } from "./utils/Result.js";

const jwksClient = createJwksClient({ jwksUri: "http://localhost:3000/api/auth/jwt/jwks.json" });
const getPublicKey: GetPublicKeyOrSecret = async (header, callback) => {
  const key = await jwksClient.getSigningKey();
  callback(null, key.getPublicKey());
};

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {},
      },
      {
        target: "pino/file",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {
          destination: "logs/out.log",
          mkdir: true,
        },
      },
    ],
  },
});

const prismaClient = new PrismaClient();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const meilisearchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
});

const yoga = createYoga<ServerContext, UserContext>({
  graphiql: process.env.ENABLE_GRAPHIQL === "true",
  schema: createSchema({
    typeDefs,
    resolvers: makeResolvers({
      neo4j: neo4jDriver,
      prisma: prismaClient,
      meilisearch: meilisearchClient,
      logger,
      config: {
        session: {
          cookieName: () => "otomadb_session",
          cookieDomain: () => process.env.DOMAIN,
          cookieSameSite: () => (process.env.ENABLE_SAME_SITE_NONE === "true" ? "none" : "strict"),
        },
      },
      token: { sign: signToken },
    }),
  }),
  async context({ req }) {
    const token = extractTokenFromReq(req);
    if (isOk(token)) {
      const decoded = await new Promise<Jwt | undefined>((res, rej) =>
        jwt.verify(token.data, getPublicKey, { complete: true }, (err, decoded) => {
          if (err) return rej(err);
          else res(decoded);
        })
      );
      if (decoded && typeof decoded.payload === "object") {
        const {
          "sub": userId,
          "st-perm": { v: permissions },
        } = decoded.payload;

        if (!userId) {
          logger.error({ payload: decoded.payload }, "Invalid token payload");
        } else {
          return {
            user: {
              id: userId,
              role: UserRole.NORMAL, // TODO: 削除
              permissions: permissions || [],
            },
          } satisfies UserContext;
        }
      }
    }

    /*
    // from cookie
    const resultExtractSession = extractSessionFromReq(req, "otomadb_session");
    if (isErr(resultExtractSession)) {
      switch (resultExtractSession.error.type) {
        case "INVALID_FORM":
          logger.warn({ cookie: resultExtractSession.error.cookie }, "Cookie is invalid form for session");
          break;
      }
    } else {
      const session = await verifySession(prismaClient, resultExtractSession.data);
      if (isOk(session))
        return {
          user: { id: session.data.user.id, role: session.data.user.role, permissions: [] },
        } satisfies UserContext;
      else {
        switch (session.error.type) {
          case "NOT_FOUND_SESSION":
            logger.warn({ id: session.error.id }, "Session not found");
            break;
          case "WRONG_SECRET":
            logger.warn({ id: session.error.id, secret: session.error.secret }, "Session secret is incorrect");
            break;
        }
      }
    }

    const token = extractTokenFromReq(req);
    if (isOk(token)) {
      const verified = await verifyToken(token.data);
      if (isOk(verified)) return verified.data;
      else {
        switch (verified.error.type) {
          case "TOKEN_EXPIRED":
            logger.warn("Token already expired");
            break;
          case "INVALID_PAYLOAD":
            logger.error({ payload: verified.error.payload }, "Token payload is invalid");
            break;
          case "UNKNOWN_ERROR":
            logger.error({ error: verified.error.error }, "Something wrong in verifing token");
            break;
        }
      }
    }

    */
    return { user: null } satisfies UserContext;
  },
  cors: (request) => {
    const origin = request.headers.get("origin");
    return {
      origin: origin || [],
      credentials: true,
    };
  },
  plugins: [
    useGenericAuth({
      mode: "protect-granular",
      resolveUserFn: ((ctx) => {
        return { id: "1", role: "NORMAL", permissions: ["test"] };
        return null;
      }) satisfies ResolveUserFn<CurrentUser>,
      validateUser: (({ user, fieldAuthDirectiveNode }) => {
        const valueNode = fieldAuthDirectiveNode?.arguments?.find((arg) => arg.name.value === "permissions")?.value as
          | ListValueNode
          | undefined;
        const requirePermissions = valueNode?.values.map((v) => (v as StringValueNode).value) || [];

        const missingPermission = requirePermissions.find((p) => !user?.permissions.includes(p));
        if (missingPermission) throw new Error(`Missing permission: ${missingPermission}`);

        return;
      }) satisfies ValidateUserFn<CurrentUser | null>,
    }),
    useDisableIntrospection({
      isDisabled() {
        return false; // TODO: 何かしら認証を入れる
      },
    }),
    useReadinessCheck({
      check: async () => {
        try {
          await Promise.all([
            prismaClient.$queryRaw`SELECT 1`
              .catch(async (e) => {
                logger.warn({ error: e }, "Prisma is not ready, reconnecting.");
                await prismaClient.$connect();
              })
              .catch((e) => {
                logger.error({ error: e }, "Prisma is not ready, reconnecting failed.");
                throw e;
              }),
            neo4jDriver.getServerInfo().catch((e) => {
              logger.error({ error: e }, "Neo4j is not ready.");
              throw e;
            }),
          ]);
        } catch {
          return false;
        }
      },
    }),
    /*
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
    }),
    */
    useLogger({
      logFn(event, data) {
        switch (event) {
          case "execute-end":
            logger.info(
              {
                // query: print(data.args.document),
                operation: data.args.operationName,
                variables: data.args.variableValues || {},
                user: data.args.contextValue.user,
                errors: data.result.errors,
              },
              "GraphQL Executed"
            );
            break;
        }
      },
    }),
  ],
});

const server = createServer(yoga);
server.listen(8080, () => {
  logger.info("Server is running on http://localhost:8080");
});
