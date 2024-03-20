# Builder
FROM node:20.11.0-slim@sha256:ecc9a2581f8588014a49a523a9ed146d27963f6d988d11bd16bbdcb3598f5f98 AS builder
WORKDIR /build

# install OpenSSL
# hadolint ignore=DL3008
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY ./package.json ./package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Runner
FROM node:20.11.0-slim@sha256:ecc9a2581f8588014a49a523a9ed146d27963f6d988d11bd16bbdcb3598f5f98 AS runner
WORKDIR /app

# hadolint ignore=DL3008
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

## install tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

## install production-only node.js dependencies
ENV NODE_ENV production

## copy build dist
COPY --from=builder /build/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node ./node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
COPY --from=builder /build/dist ./dist

ENTRYPOINT ["tini", "--"]
CMD ["node", "./dist/index.mjs"]
