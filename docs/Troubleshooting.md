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

## General Issues

### Broken Images in Web Admin (CORS)
**Issue:** Uploaded images (like ticket attachments) are requested with a valid URL (e.g., `http://localhost:5000/uploads/...`) but fail to render due to `helmet`'s default `same-origin` Cross-Origin Resource Policy.
**Solution:** Configure `helmet` in the backend `server.ts` to explicitly allow cross-origin requests:
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

### Mobile Web Support Missing Dependencies
**Issue:** Running `npx expo start --web` fails with missing `react-dom` and `react-native-web` errors.
**Solution:** Install the required web peer dependencies for Expo:
```bash
npx expo install react-dom react-native-web
```

### Mobile Notification Navigation (Nested Tabs)
**Issue:** Tapping a notification for a screen inside a nested navigator (like Top Tabs inside a Bottom Tab) fails to redirect to the correct sub-screen.
**Solution:** Use nested navigation syntax in the `navigation.navigate` call:
```typescript
navigation.navigate('Main', {
    screen: 'TabName',
    params: { screen: 'SubTabName' },
});
```