# Commands

```bash
npm run dev                          # Next dev (Turbopack), port 3000 → 3001 if busy
npm run build                        # prisma generate + next build (production)
npm run db:migrate -- --name <name>  # create + apply Prisma migration in dev
npm run db:deploy                    # apply migrations only (prod / non-interactive)
npm run db:seed                      # seeds admin + projects + imports MDX → BlogPost
npm run db:studio                    # Prisma Studio
npm run docker:dev:up                # MySQL on :3308 + Mailhog on :8025
npm run docker:prod:up               # full stack — runs migrate+seed via entrypoint

npx tsc --noEmit                     # typecheck only
npx eslint src                       # use this; `npm run lint` is broken on Next 16
```

DB shadow grant (one-shot at first setup, MySQL 9 needs it for `prisma migrate dev`):
```bash
docker exec portfolio_db mysql -uroot -p$MYSQL_ROOT_PASSWORD \
  -e "GRANT ALL PRIVILEGES ON *.* TO 'portfolio'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```
