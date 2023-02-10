# Builder
FROM node:19-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

## build
COPY ./codegen.yml ./tsconfig.json tsup.config.ts ./
COPY ./src ./src
COPY ./prisma/schema.prisma ./prisma/schema.prisma
COPY ./codegen-plugins ./codegen-plugins
RUN npm run build

# Runner
FROM node:19-slim AS runner
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
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]

