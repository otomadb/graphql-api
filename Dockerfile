# Builder
FROM node:18-slim AS builder
WORKDIR /app

## install pnpm
ADD https://github.com/pnpm/pnpm/releases/download/v7.17.1/pnpm-linux-x64 /bin/pnpm
RUN chmod +x /bin/pnpm

## install all node.js dependencies
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
RUN pnpm install -r --offline

## build
COPY ./codegen.yml ./tsconfig.json ./tsconfig.prod.json ./
COPY src ./src
COPY codegen-plugins ./codegen-plugins
RUN pnpm run codegen && \
  pnpm run build

# Runner
FROM node:18-slim AS runner
WORKDIR /app

## install tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

## install pnpm
ADD https://github.com/pnpm/pnpm/releases/download/v7.17.1/pnpm-linux-x64 /bin/pnpm
RUN chmod +x /bin/pnpm

## install production-only node.js dependencies
ENV NODE_ENV production
COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod
COPY package.json ./
RUN pnpm install -r --offline --prod

## copy build dist
COPY --from=builder /app/dist ./dist

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]

