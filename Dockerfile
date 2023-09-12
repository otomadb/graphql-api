# Builder
FROM node:20-slim@sha256:86e9e023e957ba57c2a5d13d0ca978b5019e03eb78cf08a4af8f80abbab23249 AS builder
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN npm run prisma:client

COPY ./codegen.yml ./
COPY ./src ./src
RUN npm run codegen

COPY ./tsconfig.json rollup.config.js ./
RUN npm run rollup:build

# Runner
FROM node:20-slim@sha256:86e9e023e957ba57c2a5d13d0ca978b5019e03eb78cf08a4af8f80abbab23249 AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl=3.0.9-1 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

## install tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

## install production-only node.js dependencies
ENV NODE_ENV production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

## copy build dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.mjs"]

