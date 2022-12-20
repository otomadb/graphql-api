# builder
FROM node:18-slim AS builder
WORKDIR /app

COPY package.json ./
RUN corepack enable

COPY pnpm-lock.yaml ./
RUN pnpm install

COPY ./codegen.yml ./tsconfig.json ./
COPY src ./src
RUN pnpm run codegen
RUN pnpm run build

# runner
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV production

## tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

COPY package.json ./
RUN corepack enable

COPY pnpm-lock.yaml ./
RUN pnpm install

COPY --from=builder /app/dist ./dist

ENTRYPOINT ["/tini", "--"]
CMD ["node", "dist/index.js"]

