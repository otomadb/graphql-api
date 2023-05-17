/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production";

    readonly ENABLE_GRAPHIQL?: string;
    // readonly ENABLE_INTROSPECTION?: string;

    readonly AUTH0_DOMAIN: string;
    readonly AUTH0_MANAGEMENT_API_TOKEN: string | undefined;
    readonly AUTH0_CLIENT_ID: string;
    readonly AUTH0_CLIENT_SECRET: string;
    readonly AUTH0_EDITOR_ROLE_ID: string;
    readonly AUTH0_ADMIN_ROLE_ID: string;

    readonly PRISMA_DATABASE_URL: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;

    readonly REDIS_URL: string;

    /* Meilisearch */
    readonly MEILISEARCH_URL: string;

    readonly SOUNDCLOUD_CLIENT_ID: string;
  }
}
