# Builder
FROM node:18-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

## build
COPY ./codegen.yml ./tsconfig.json tsup.config.ts ./
COPY src ./src
COPY codegen-plugins ./codegen-plugins
RUN npm run codegen && \
  npm run build

# Runner
FROM node:18-slim AS runner
WORKDIR /app

## install tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

## install production-only node.js dependencies
ENV NODE_ENV production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

## copy build dist
COPY --from=builder /app/dist ./dist

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]

