# Progress Log

## Phase 1: Foundation (Backend & Database) — ✅ COMPLETED
**Date:** 2026-02-23

- Initialized `/backend` with Express + TypeScript + Prisma.
- Docker PostgreSQL 15 via `docker-compose.yml`.
- 5 Prisma models (User, Apartment, Invoice, Ticket, Announcement) with 3 enums.
- Clean Architecture scaffold: `routes/`, `controllers/`, `services/`, `middlewares/`.
- Working `/api/health` endpoint.

---

## Phase 2: Core APIs — ✅ COMPLETED
**Date:** 2026-02-23

- JWT auth (`POST /api/auth/login`), bcrypt password hashing.
- CRUD for Users, Apartments, Invoices, Tickets, Announcements.
- 13 REST endpoints total, all following Route → Controller → Service → Prisma.
- Global error handler with standardized `ApiErrorResponse`.

---

## Phase 3: Admin Web App (React) — ✅ COMPLETED
**Date:** 2026-02-23

- Vite + React + TypeScript + Tailwind CSS v4.
- Dark sidebar layout, 5 pages: Dashboard, Residents, Invoices, Tickets, Announcements.
- Live data from backend, status badges, Add Apartment modal, Mark as Paid, inline status dropdown.
- `services/api.ts` centralized axios client.

---

## Phase 4: Resident Mobile App (React Native) — ✅ COMPLETED
**Date:** 2026-02-23

- Expo + React Native + TypeScript.
- Login with AsyncStorage persistence, auth context.
- 3-tab bottom navigator: Home (balance + pay), Tickets (list + create), Announcements (feed).
- Mongolian UI labels, elder-friendly large buttons/text.
- Configurable `API_BASE_URL` in `src/config.ts` (set to `192.168.0.128`).

### Bug Fixes
- **Login response missing `apartmentId`:** Updated `authService.ts` to include `apartmentId` in the `LoginResult` user object. Without this, ticket creation from mobile always failed.
- **Type-only imports:** Fixed `verbatimModuleSyntax` errors across all web-admin page components.

### End-to-End Verified ✅
- Mobile app → Created a ticket ("ГЭМТЭЛД") → Appeared in Web Admin tickets table with correct user name and apartment.

---

## Phase 5: Enhanced Ticketing & Analytics — ✅ COMPLETED
**Date:** 2026-02-23

### Task 5.1 — Schema
- Added `TicketComment` model to `schema.prisma` with `content`, `ticketId`, `userId` fields.
- Relations: `Ticket.comments[]`, `User.ticketComments[]`. Mapped to `ticket_comments` table.
- Migration `add_ticket_comments` applied.

### Task 5.2 — Image Uploads
- Installed `multer` + `@types/multer`, created `uploadMiddleware.ts` (5MB limit, images only).
- Updated `server.ts` to serve `/uploads` statically, updated ticket POST to accept `multipart/form-data`.
- Installed `expo-image-picker` in mobile-app, updated `TicketsScreen.tsx` with image picker + FormData upload.

### Task 5.3 — Ticket Comments
- Backend: `commentService.ts`, `commentController.ts`, `commentRoutes.ts` (mergeParams sub-router).
- Web Admin: `TicketDetailModal.tsx` with chat-style comment thread, image display. Tickets rows are clickable.
- Mobile App: `TicketDetailScreen.tsx` with chat bubbles, image display, reply input. Ticket cards are tappable.

### Task 5.4 — Analytics Dashboard
- Installed `recharts` in web-admin.
- Dashboard: stat cards (kept) + BarChart (monthly collected vs unpaid) + PieChart (ticket status breakdown).

---

## Phase 6: Notifications, Account & UX Improvements — ✅ COMPLETED
**Date:** 2026-02-23

### Task 6.1 — Notification System (Backend)
- Added `Notification` model + `NotificationType` enum to Prisma schema. Migration `add_notifications` applied.
- `notificationService.ts` — CRUD: `getNotificationsByUserId`, `getUnreadCount`, `markAsRead`, `markAllRead`, `createNotification`.
- `notificationController.ts` + `notificationRoutes.ts` mounted at `/api/notifications`.
- Auto-notification triggers:
  - New ticket created → all ADMINs notified.
  - Ticket status changed → ticket owner notified.
  - New comment added → ticket owner + all ADMINs (except commenter) notified.
  - New announcement created → all RESIDENT users notified.

### Task 6.2 — Announcements Full CRUD (Web Admin)
- `Announcements.tsx` rebuilt with create form, inline edit (pencil icon), delete with confirm dialog, meeting link support.
- Backend: `updateAnnouncement` + `deleteAnnouncement` service/controller/routes (PUT/DELETE `/:id`).

### Task 6.3 — Notification UI (Web Admin)
- `NotificationDropdown.tsx` — bell icon with unread count badge, dropdown panel, mark-all-read, click-to-navigate (routes to `/tickets`, `/invoices`, `/announcements` by type).
- Polls every 15 seconds. Integrated into `Header.tsx`.

### Task 6.4 — Account Screen (Mobile & Web Admin)
- Mobile `AccountScreen.tsx` — dark-themed profile card, user info, password change form (placeholder), logout button.
- Web Admin `/account` route added, avatar in header links to it.

### Task 6.5 — Mobile Navigation Restructure
- Removed "Мэдэгдэл" tab from bottom navigator → 4 tabs: Нүүр, Хүсэлт, Зарлал, Бүртгэл.
- Added `HeaderBell` component with unread badge (polls every 10s) to header of all tab screens.
- Switched from `@react-navigation/native-stack` to `@react-navigation/stack` (JS-based, Expo-compatible).
- Bell tap navigates to Notifications screen via parent Stack navigator.
- Notification tap marks as read + navigates to relevant tab (Хүсэлт or Зарлал).

### Task 6.6 — UX Polish
- **Image lightbox (Web Admin):** Clicking ticket images in `TicketDetailModal` opens full-screen overlay. Click ✕ or backdrop to close.
- **Comment counts:** Backend `getAllTickets` now includes `_count.comments`. Displayed as 💬 column in web-admin tickets table and `💬 X` in mobile ticket cards.

### Bug Fixes
- Fixed `navigation.navigate('Notifications')` error by using `navigation.getParent()?.navigate()`.
- Installed `react-native-screens` + `react-native-gesture-handler` for stack navigator.

---

## Phase 6B: Transparency & Reporting — ✅ COMPLETED
**Date:** 2026-02-23

### Task 6B.1 — Schema & Migration
- Added `WorkPlanStatus` enum (`PLANNED`, `IN_PROGRESS`, `COMPLETED`) to Prisma schema.
- Added `WorkPlan` model: `id`, `title`, `description`, `status`, `expectedDate`, `imageUrl`, timestamps. Table: `work_plans`.
- Added `FinancialReport` model: `id`, `month`, `year`, `totalIncome` (Float), `totalExpense` (Float), `description`, `imageUrl`, timestamps. Unique: `[month, year]`. Table: `financial_reports`.
- Migration `add_transparency_models` applied.

### Task 6B.2 — Backend CRUD APIs
- `workPlanService.ts` — `createWorkPlan`, `getAllWorkPlans`, `updateWorkPlan`, `deleteWorkPlan`.
- `workPlanController.ts` — POST/GET/PUT/DELETE controllers with `req.file` image support.
- `workPlanRoutes.ts` — mounted at `/api/work-plans`, POST and PUT use existing `uploadSingle` middleware.
- `financialReportService.ts` — `createFinancialReport`, `getAllFinancialReports`, `updateFinancialReport`, `deleteFinancialReport`.
- `financialReportController.ts` — POST/GET/PUT/DELETE with image upload + 409 conflict for duplicate month/year.
- `financialReportRoutes.ts` — mounted at `/api/financial-reports`, POST and PUT use existing `uploadSingle` middleware.
- Both route sets registered in `routes/index.ts`.

### Task 6B.3 — Web Admin UI
- Added `WorkPlan` and `FinancialReport` TypeScript interfaces to `api.ts`.
- Added `workPlanApi` and `financialReportApi` with FormData upload support.
- Sidebar: added "Work Plans" (ClipboardList icon) and "Financials" (BarChart3 icon) nav items.
- `WorkPlans.tsx` — CRUD table with inline status dropdown, create/edit modal, image upload/display, delete with confirmation.
- `Financials.tsx` — Card-based layout with income/expense/balance summary, create/edit modal with month/year picker, image upload, ₮ currency formatting.
- Routes added to `App.tsx`.

### Task 6B.4 — Mobile App UI
- Added `WorkPlan` and `FinancialReport` interfaces and read-only API methods to mobile `api.ts`.
- `TransparencyScreen.tsx` — Segmented control: "🔨 Ажлууд" / "💰 Санхүү". Work plan cards with status badges (Төлөвлөсөн/Хийгдэж буй/Дууссан), images, expected dates. Financial report cards with income/expense/balance in ₮, receipt images. Pull-to-refresh. Mongolian UI labels.
- `TabNavigator.tsx` — Added "Шилэн СӨХ" tab with `eye` icon between Зарлал and Бүртгэл.

---

## Phase 7: QPay Integration & Password Change — ✅ COMPLETED
**Date:** 2026-02-24

### Task 7.1 — QPay Integration (Mock)
- Added `qpayUrl` (String?) and `qpayInvoiceId` (String?) fields to `Invoice` model. Migration `add_qpay_fields` applied.
- `qpayService.ts` — `generateQpayInvoice` creates mock QPay invoice ID, URL, Base64 QR code (SVG), and 5 bank deep links (Khan Bank, Golomt, State Bank, TDB, Xac Bank). Idempotent: returns existing data if already generated.
- `qpayService.ts` — `processQpayWebhook` handles QPay callback, marks invoice as PAID with timestamp. Idempotent for retries.
- `qpayController.ts` — `createQpayInvoiceController` (POST `/api/invoices/:id/qpay`) + `qpayWebhookController` (POST `/api/webhooks/qpay`).
- `webhookRoutes.ts` — Public webhook endpoint (no auth) mounted at `/api/webhooks/qpay`.
- `invoiceRoutes.ts` updated with QPay generation route.
- Mobile `HomeScreen.tsx` — Pay Now button triggers QPay invoice generation, opens slide-up modal with QR code image and bank deep link buttons. Refreshes invoices on close.
- Mobile `api.ts` — Added `invoiceApi.createQpay()`, `QpayResponse` and `QpayBankLink` interfaces.
- Installed `uuid` + `@types/uuid` for mock QPay ID generation.

### Task 7.4 — Password Change
- `authMiddleware.ts` — JWT verification middleware that extracts token from `Authorization: Bearer` header and populates `req.user` with `userId` and `role`. Extends Express `Request` type.
- `authService.ts` — Added `changePassword(userId, {oldPassword, newPassword})`: verifies old password via bcrypt, validates 6-char minimum, hashes new password, updates DB.
- `authController.ts` — Added `changePasswordController` (PUT `/api/auth/password`).
- `authRoutes.ts` — New `PUT /password` route protected by `authMiddleware`.
- Mobile `AccountScreen.tsx` — Wired password change form to real API (`authApi.changePassword`), shows loading state and backend error messages.
- Mobile `api.ts` — Added auth token interceptor (reads from AsyncStorage), `authApi.changePassword()`.
- Web Admin `Account.tsx` — Password change form logins first to get JWT, then calls PUT `/auth/password`. Shows inline success/error feedback.
- Web Admin `api.ts` — Added auth token interceptor (reads from localStorage), `authApi.changePassword()`.

### API Verification Results
- `POST /api/invoices/:id/qpay` → Returns `qpayInvoiceId`, `qpayUrl`, QR Base64, 5 deep links ✅
- `POST /api/webhooks/qpay` → Marks invoice as PAID with `paidAt` timestamp ✅
- `PUT /api/auth/password` → Returns 401 without token (auth middleware works) ✅
- `tsc --noEmit` → Zero errors ✅

### Task 7.2 — Push Notifications (Expo)
- Added `expoPushToken` (String?) to `User` model. Migration `add_push_token` applied.
- Installed `expo-server-sdk` on backend.
- `pushNotificationService.ts` — `sendPushToUser()` and `sendPushToUsers()` using Expo push API. Silent skip for users without tokens, fire-and-forget pattern.
- `notificationService.ts` — `createNotification()` now auto-triggers `sendPushToUser()` after DB insert. All existing triggers (announcements, tickets, comments) get push for free.
- `userController.ts` — `updatePushTokenController` for `PUT /api/users/push-token` with Expo token format validation.
- `userService.ts` — `updatePushToken()` saves token to User record.
- `userRoutes.ts` — `PUT /push-token` route protected by `authMiddleware`.
- Mobile: Installed `expo-notifications`, `expo-device`, `expo-constants`.
- `usePushNotifications.ts` — Custom hook: requests permission, retrieves `ExpoPushToken`, sends to backend, handles foreground alerts, Android notification channel. Expo SDK 54 compatible.
- `App.tsx` — `usePushNotifications(!!token)` wired into `RootNavigator`.

---

## Phase 8: Digital Voting & E-Barimt — ✅ COMPLETED
**Date:** 2026-02-24

### Task 8.1 — Digital Voting
- **Database:** Added `PollStatus` enum, `Poll`, `PollOption`, `PollVote` models with cascading deletes and unique user-per-poll constraint. Migration `add_polls_and_ebarimt`.
- **Backend:** `pollService.ts` (create, list with vote counts, cast vote with double-vote prevention, close poll), `pollController.ts`, `pollRoutes.ts` mounted at `/api/polls`.
- **Web Admin:** Installed `recharts`. Created `Polls.tsx` with create poll form (dynamic options), Recharts horizontal bar charts for vote distribution, per-option breakdown with color-coded dots, close poll with confirmation. Added to `Sidebar.tsx` (Vote icon) and `App.tsx` route.
- **Mobile App:** Created `PollsScreen.tsx` with elderly-friendly design: large radio-style option buttons (16px padding), progress bars for results (shown after voting), Mongolian labels. Added as 'Санал' tab in `TabNavigator.tsx`.

### Task 8.2 — E-Barimt (E-Receipt Mock Integration)
- **Database:** Added `ebarimtId`, `lotteryNumber`, `ebarimtQrCode` fields to `Invoice` model.
- **Backend:** `ebarimtService.ts` generates mock E-Barimt data (receipt ID, 8-digit lottery number, QR PNG as base64 via `qrcode` package). Hooked into `qpayService.processQpayWebhook()` as fire-and-forget auto-generation on payment. `GET /api/invoices/:id/ebarimt` endpoint added.
- **Mobile App:** Added `EbarimtData` type and `ebarimtApi.get()` to `api.ts`. HomeScreen now shows "Төлөгдсөн нэхэмжлэхүүд" (Paid Invoices) section with blue "🧾 И-Баримт" button. E-Barimt modal displays receipt ID, lottery number (🎰), amount, and QR code image.

---

### UX/UI Refactoring (Mobile App)

**Bottom Navigation (6 → 4 tabs):**
- Reduced from 6 tab icons to 4: **Нүүр** (Home), **Хүсэлт** (Tickets), **Мэдээ** (Community), **Шилэн СӨХ** (Transparency).
- Created `CommunityScreen.tsx` — Material Top Tab Navigator combining Announcements ("Зарлал") and Polls ("Санал") with swipeable gesture navigation.
- Removed standalone Announcements and Polls tabs; removed Account tab.

**Profile Relocated to Header:**
- Added user avatar button (initial letter) to header-right of all tab screens.
- Tapping avatar navigates to `AccountScreen` via stack navigator overlay.
- Added `Account` stack screen in `App.tsx`.

**Home Screen Polish:**
- Invoice cards now use soft shadows instead of flat borders (`shadowOpacity: 0.06`, `elevation: 3`).
- Balance card has depth shadow (`elevation: 6`).
- Rounded corners increased to `borderRadius: 16`.

**Transparency Screen — Image Fix:**
- Changed `cardImage` from fixed `height: 160` to `aspectRatio: 16/9` with `resizeMode: "cover"`.
- Images no longer appear stretched or squished.

**Push Notification Fix:**
- `usePushNotifications.ts` now gracefully skips when `projectId` is missing (dev/Expo Go).

---

## Next: Phase 9+ (Roadmap)
- **Phase 9:** AI chatbot for common resident questions.
