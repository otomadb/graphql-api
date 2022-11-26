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
5. access tokenが必要な場合は次のLoginクエリを叩く

```graphql
mutation Login($name: String!, $password: String!) {
  signin(input: { name: $name, password: $password }) {
    accessToken
    refreshToken
    user {
      id
    }
  }
}
```

### `data`

- `accounts.json`
  - `testuser1`のパスワード: `password`
