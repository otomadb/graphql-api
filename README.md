# API

## Setup

### Requirements

#### Nixユーザ

- `direnv allow`

#### その他のユーザ

- deno 1.27.1

### 手順

1. `docker compose up -d`
2. `deno task dev`
3. 適当なGraphQLクライアント（[Altair](https://altairgraphql.dev/)など）で`localhost:8080`を見る
4. クエリなどは[web](https://github.com/otomad-database/web)などを参照

### `data`

- `accounts.json`
  - `testuser1`のパスワード: `password`
