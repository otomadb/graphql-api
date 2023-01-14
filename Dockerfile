# Builder
FROM node:18-slim AS builder
WORKDIR /app

## install pnpm
ENV PNPM_VERSION v7.17.1
ADD https://github.com/pnpm/pnpm/releases/download/${PNPM_VERSION}/pnpm-linux-x64 /bin/pnpm
RUN chmod +x /bin/pnpm

## install all node.js dependencies
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
RUN pnpm install -r --offline

## build
COPY ./codegen.yml ./tsconfig.json ./
COPY src ./src
COPY codegen-plugins ./codegen-plugins
RUN pnpm run codegen && \
  pnpm run build

# Runner
FROM node:18-slim AS runner
WORKDIR /app

## install tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /bin/tini
RUN chmod +x /bin/tini

## install pnpm
ENV PNPM_VERSION v7.17.1
ADD https://github.com/pnpm/pnpm/releases/download/${PNPM_VERSION}/pnpm-linux-x64 /bin/pnpm
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

