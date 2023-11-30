# Builder
FROM node:21.2.0-slim@sha256:9cbf7eced7de09dcc8d0bd159232c52b64de722ce5f3d219753e6b426e9ce5ea AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl=3.0.11-1~deb12u1 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN npm run prisma:client

COPY buf.gen.yaml ./
COPY proto ./proto
RUN npm run generate:buf

COPY ./codegen.yml ./
COPY ./src ./src
RUN npm run codegen

COPY ./tsconfig.json rollup.config.js ./
RUN npm run rollup:build

# Runner
FROM node:21.2.0-slim@sha256:9cbf7eced7de09dcc8d0bd159232c52b64de722ce5f3d219753e6b426e9ce5ea AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl=3.0.11-1~deb12u1 \
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

