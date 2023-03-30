/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production";

    readonly ENABLE_GRAPHIQL?: string;
    // readonly ENABLE_INTROSPECTION?: string;
    readonly ENABLE_SAME_SITE_NONE?: string;

    readonly JWT_SECRET: string;

    readonly PRISMA_DATABASE_URL: string;

    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;

    /* Meilisearch */
    readonly MEILISEARCH_URL: string;

    /* test */
    readonly PRISMA_DATABASE_URL: string;
    readonly NEO4J_URL: string;
    readonly NEO4J_USERNAME: string;
    readonly NEO4J_PASSWORD: string;
  }
}
