# API

## Setup

### docker compose

```
docker-compose up -d
```

8081 番ポートに adminer が立ち上がる．

### migration の実行

環境変数`DATABASE_URL`に postgres の接続先を入れておく．(`.env.example`参照．)

```bash
pnpm i
pnpm run typeorm migration:run
```

## 簡易的な本番環境

```
docker compose -f docker-compose.prod.yml up -d
```

`4000`番ポートに API が立ち上がる．

## dump

```
dc exec postgres pg_dump --username=user --dbname=test > dump/$(date +"%s").sql
```
