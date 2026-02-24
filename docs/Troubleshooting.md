# Troubleshooting Log

## Phase 1: Foundation

### No structural issues encountered.
All files were created without errors. The Clean Architecture structure follows `Constitution.md` exactly:
```
Routes → Controllers → Services → Database (Prisma)
```

### Reminder: Required pre-steps before server start
1. **Docker Desktop** must be running before `docker-compose up -d`.
2. Run `npx prisma migrate dev --name init` after DB is up to apply the schema.
3. If `npm install` was interrupted, re-run it before starting the dev server.