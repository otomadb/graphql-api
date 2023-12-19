FROM node:20.10.0-slim@sha256:e941e22afee9c5d1e96f7e3db939894c053f015e45ad9920793d78a6234dfe11
WORKDIR /app

# install OpenSSL
# hadolint ignore=DL3008
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

## install tini
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

COPY ./package.json ./package-lock.json ./
RUN npm ci --ignore-scripts

COPY ./prisma ./prisma

ENTRYPOINT ["tini", "--"]
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]
