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

## Phase 11 & 12: Advanced Billing & Vehicles

### Port 5000 Already in Use
**Issue:** `[nodemon] app crashed` with `Error: listen EADDRINUSE: address already in use :::5000`.
**Solution:** Find the process ID (PID) locking the port using `netstat -ano | findstr :5000` and forcefully kill it with `taskkill /F /PID <PID>`.

### Prisma Validation Error on `DATABASE_URL`
**Issue:** Prisma throws `error: Error validating datasource db: the URL must start with the protocol postgresql://`.
**Solution:** Ensure the `DATABASE_URL` in the `backend/.env` file is NOT wrapped in double quotes. Change `DATABASE_URL="postgresql://..."` to `DATABASE_URL=postgresql://...`. Prisma strictly parses the raw string and includes quotes if present.