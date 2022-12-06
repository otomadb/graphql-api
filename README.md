# API

## Setup

### docker compose

```
docker-compose up -d
```

8081番ポートにadminerが立ち上がる．

### migrationの実行

環境変数`DATABASE_URL`にpostgresの接続先を入れておく．(`.env.example`参照．)

```bash
pnpm i
pnpm run typeorm migration:run
```

