# Postgres

日々の作業の中でのメモ

## Nuke

全てを削除する

```shell
psql $PRISMA_DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Dump

```shell
# Nix環境のみ
nix profile install nixpkgs#postgresql_15

pg_dump $PRISMA_DATABASE_URL > ./dumps/$(date '+%s').sql
```

## Restore

```shell
psql $PRISMA_DATABASE_URL < ./dumps/$(ls -1r ./dumps | head -n 1)
```
