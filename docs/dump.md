## dump

```bash
$ kubectl port-forward -n prod-otomadb postgresql-0 25432:5432

$ pg_dump $PRISMA_DATABASE_URL > dumps/$(unixtime).sql
```

## restore

```
$ psql $PRISMA_DATABASE_URL < ./dumps/1694251188.sql
```
