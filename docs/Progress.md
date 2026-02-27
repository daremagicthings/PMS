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



## Phase 9: UX/UI Refactoring — ✅ COMPLETED

**Date:** 2026-02-25



### Task 9.1 — Material Top Tab Navigator

- Replaced custom segmented control in `CommunityScreen.tsx` with `@react-navigation/material-top-tabs`.

- Swipeable gesture navigation between "📢 Зарлал" (Announcements) and "🗳️ Санал" (Polls).

- Dark tab bar styling matches app header (`#0f172a` background, `#3b82f6` indicator).

- Installed `@react-navigation/material-top-tabs` + `react-native-pager-view`.



### Task 9.2 — Profile Relocated (verified existing)

- Header avatar button already in place from prior session. Confirmed working.



### Task 9.3 — UI Polish

- `HomeScreen.tsx` card shadows enhanced: deeper colored shadows (`#64748b`), increased `shadowOpacity: 0.08`, `shadowRadius: 10`, `elevation: 4`, subtle `borderColor: #f1f5f9` border.

- Balance card shadow upgraded to `#1e3a5f` color, `elevation: 8`.

- Transparency screen image fix (aspectRatio + cover) already in place.



---



## Phase 10: Advanced Lease & Property Management — ✅ COMPLETED

**Date:** 2026-02-25



### Task 10.1 — Schema & Migration

- Added 6 fields to `Apartment` model: `unitType` (default "APARTMENT"), `ownerId`, `tenantId`, `leaseStartDate`, `leaseEndDate`, `contractId`.

- Migration `advanced_property` applied.



### Task 10.2 — Backend Service & Controller

- `apartmentService.ts` — Extended `CreateApartmentInput` with all lease fields. Added `UpdateApartmentInput` interface and `updateApartment()` function.

- `apartmentController.ts` — Added `updateApartmentController` for PUT requests.

- `apartmentRoutes.ts` — Added `PUT /:id` route.



### Task 10.3 — Web Admin UI

- `api.ts` — `Apartment` interface extended with 6 new fields. `apartmentApi.update()` added. `create()` signature extended.

- `Residents.tsx` — Complete rebuild:

  - **Tabs:** "🏠 Орон сууц" (Apartments) and "📋 Түрээсийн талбай" (Leased Spaces: MUSAR/BASEMENT) with count badges.

  - **Table:** Leased tab shows owners, tenants, lease periods. Both tabs have per-row Edit buttons.

  - **Modal:** Unit type selector, Owner/Tenant user dropdowns, lease date pickers, contract ID input.

  - **Empty states:** Custom illustrations for each tab.



---



## Phase 11: Advanced Billing & Penalties — ✅ COMPLETED

**Date:** 2026-02-25



### Task 11.1 — Schema & Migrations

- Added `penaltyAmount` (Float, default 0) to `Invoice` model.

- Completed migration `billing_vehicles`.



### Task 11.2 — Backend APIs

- Updated `GET /api/invoices` (`getInvoicesForResident`) to allow dual visibility (both `ownerId` and `tenantId` can view the invoice).

- Created `POST /api/invoices/calculate-penalties` (Admin only) to append a flat 5,000 MNT penalty.



### Task 11.3 — Mobile UI Update

- Displayed total penalty clearly in red text (`#ef4444`) on the Mobile App's Home Screen balance card.

- Updated individual invoice UI to display `+₮X торгууль` in red below the total amount.



---



## Phase 12: Operations, Vehicles & Content — ✅ COMPLETED

**Date:** 2026-02-25



### Task 12.1 — Vehicle Registry

- Added `Vehicle` model (`licensePlate`, `makeModel`) to the Prisma schema, mapped to `Apartment`.

- Implemented backend CRUD endpoints (`/api/vehicles`).

- Built Web Admin "Vehicles" (Автомашин) Page to filter, add, and update registered vehicles.



### Task 12.2 — Enhanced Work Plans

- Added `category` field ("REGULAR", "SCHEDULED", "AD_HOC") to `WorkPlan` model.

- Updated the Web Admin "Work Plans" UI to support editing categories directly.



### Task 12.3 — Mobile Static Content

- Added "Дүрэм журам", "Түгээмэл асуултууд", and "Санал хүсэлт" menu list options to the `AccountScreen.tsx`.

- Integrated `Alert`-based static native pop-ups with dummy text for easy reading.



---



## Phase 12B: Dynamic Content (FAQ & Rules) — ✅ COMPLETED

**Date:** 2026-02-25



### Task 12B.1 — Schema & Migrations

- Added `StaticContent` model (for Rules & Inquiries, singletons by `type`).

- Added `Faq` model (`question`, `answer`, `order`).

- Completed migration `dynamic_content`.



### Task 12B.2 — Backend APIs

- Created `contentRoutes.ts`, `contentController.ts`, `contentService.ts`.

- `GET /api/content/faqs` and `GET /api/content/static/:type` (Public/Residents).

- `PUT/POST/DELETE` endpoints (Admin only).



### Task 12B.3 — Web Admin UI

- Built `ContentSetup.tsx` page to let Admins dynamically create/edit FAQ lists and update the large text blocks for "Rules" and "Inquiries".

- Added "Мэдээлэл" to Sidebar.



### Task 12B.4 — Mobile Integration

- Replaced hardcoded `Alert` messages in `AccountScreen.tsx`.

- The Mobile App now fetches real-time content from the DB for `FAQ`, `RULES`, and `INQUIRIES` when the user taps on the respective menu rows.



---



## Phase 14: Mobile App UX/UI & Resident Features (Part 1) — ✅ COMPLETED

**Date:** 2026-02-26



### Task 14.1 — Multi-Property Management

- **Backend:** Created `apartmentService.getMyApartments(userId)` to fetch properties where user is an owner, tenant, or general resident. Added `GET /api/apartments/my-apartments` endpoint protected by auth.

- **Mobile App:** Updated `HomeScreen` to fetch full invoice lists and apartment list concurrently. Built a horizontal property selector. Invoices and totals now update dynamically based on the selected property.



### Task 14.2 — Bulk Invoice Payment (QPay)

- **Backend:** Added `qpayService.generateBulkQpayInvoice(invoiceIds)` to generate a single QPay QR mapping to multiple invoices. Added `POST /api/invoices/qpay-bulk`. 

- **Backend Webhook:** Modified `processQpayWebhook` to handle multiple invoices simultaneously and update status/barimt in parallel.

- **Mobile App:** Added checkbox UI to `HomeScreen` invoice rows. "Pay Now" button scales to "Pay Selected (₮X)" dynamically. Handled fallbacks for single-vs-bulk payment flows.



### Task 14.3 — Corporate vs Citizen E-Barimt (Settings)

- **Database:** Added `ebarimtType` (String, default "CITIZEN") and `ebarimtRegNo` (String?) to `User` model.

- **Backend:** Added `PUT /api/users/ebarimt-settings` endpoint to update the user's registry preferences.

- **Mobile App:** Added `E-Barimt Settings` toggle box to `AccountScreen`. Users can select between Citizen and Entity and provide their TTDD. Integrated with API successfully.



### Task 14.6 — Content UI & Navigation Refactoring (Polish)

- **Web Admin:** Verified `upsertStaticContent` connects to the proper payload for saving "СӨХ-ийн дүрэм журам" and "Лавлагаа".

- **Mobile App:** Removed "Харилцах" (Contacts) from the primary bottom tabs to clear up navigation. Moved the Contacts button into the `AccountScreen` menu list.

- **Mobile App:** Transformed static content `Alert` dialogs into a dedicated full-screen `StaticContentScreen` for better readability of large texts like Rules and FAQs.



---



## Phase 15: Advanced Admin Operations & Accounting (Part 1) — ✅ COMPLETED

**Date:** 2026-02-26



### Task 15.1 — Expanded Unit Types (Parking & Storage)

- **Database:** Prisma schema configured with `PARKING` and `STORAGE` as `unitType` string values and a self-relation `parentApartmentId` linking `Apartment` to `Apartment`. Applied via `npx prisma db push`.

- **Backend:** Updated `apartmentService.getAllApartments` to fetch nested `parentApartment` and `childApartments`.

- **Web Admin:** Updated `Residents.tsx` UI to allow selecting `PARKING` (🚗 Граж) and `STORAGE` (📦 Агуулах). Conditionally rendered a parent apartment dropdown to establish the hierarchy directly from the UI. Displayed relation logic in the main table.



### Task 15.2 — Excel Import for Bulk Invoicing

- **Backend:** Installed `xlsx`. Implemented `invoiceService.bulkImportInvoices` which reads the spreadsheet, matches rows against the `Apartment` database table by building/entrance/unit mapping, and efficiently constructs `Invoice` entries. Created `POST /api/invoices/bulk-import` route linked to `multer`'s `uploadSingle`. Returns a `{successCount, errorCount, errors}` response.

- **Web Admin:** Completely revamped `Invoices.tsx` to include an "Import Excel" button. Uses a Modal + file dropzone UI, parses JSON via the frontend to generate a downloadable "Template" spreadsheet matching expected format, and surfaces real-time counts of imported/failed records.



### Task 15.3 — Bank Statement Reconciliation

- **Database:** `BankStatement` model established, mapping external bank deposits to `Invoice` records.

- **Backend:** `bankStatementService.ts` & `bankStatementController.ts` handling `POST /api/bank-statements/upload` (XLSX parsing), `POST /api/bank-statements/auto-match` (regex matching "Bldg-Unit" to pending invoices), and a manual match endpoint. Mounted in `routes/index.ts`.

- **Web Admin:** Built `/reconciliation` page with an intuitive Split-Screen layout. Left pane shows `PENDING` statements, right pane shows `PENDING` invoices. Integrated file upload, "Auto Match" functionality, and floating action bar for manual 1-to-1 matching and simultaneous invoice payment execution. Added to Sidebar.



### Task 15.6 — Advanced Invoice Management (Export & Filter)

- **Backend:** Updated `invoiceService.getAllInvoices` and `.getInvoicesForResident` to conditionally apply object filters (`status`, `startDate`, `endDate`, `apartmentId`) into Prisma's `whereClause`. 

- **Web Admin:** Modified Web Admin header in `Invoices.tsx` to include `status` select, 2 dynamic `date` pickers (Start/End Date range), and a local filter search by `unitSearch`. Data automatically re-fetches with a `300ms` debounce.

- **Web Admin:** Implemented frontend exporting by injecting the current filtered `Invoice[]` mapped object array into the `xlsx` library and converting to `.xlsx` sheets (i.e. 'Download to Excel').



### Task 15.4 & 15.5 — Detailed Transaction Transparency & PDF Export

- **Database:** Added `FinancialTransaction` model (date, amount, receiverSender, description, type: INCOME/EXPENSE) linked to `FinancialReport`. Migrated DB using `db push`.

- **Backend:** Implemented CRUD endpoints for transactions under `/api/financial-transactions`. Created `/api/financial-reports/:id/pdf` using `pdfkit` to stream formatted reports.

- **Web Admin:** Completely updated `Financials.tsx`. Added a slide-over Drawer that fetches and lists individual transactions for a selected month, allowing Admins to add/delete line items.

- **Mobile App:** Created `FinancialDetailScreen.tsx` with a transaction timeline list and a "Тайлан татах (PDF)" button. Integrated `expo-file-system` and `expo-sharing` for native download and sharing.



---



## Next: Phase 13 (AI Chatbot)

- **Phase 13:** AI Chatbot Setup.



---



## Phase 16: Multi-Tenancy Database Migration � ? COMPLETED

**Date:** 2026-02-27



### Task 16.1 � Multi-Tenancy for Contacts & FAQs

- **Database:** Added `organizationId` to `Contact` and `Faq` models. Handled DB drift by pushing schema.

- **Backend:** Updated `contactService`, `contentService`, and their respective controllers to filter and save entries by the logged-in user's `organizationId`.

- **Reset:** All dummy data wiped using `npx prisma migrate reset` and migration history correctly synchronized with a clean slate.




---

## Phase 13: AI Chatbot � ? COMPLETED
**Date:** 2026-02-27

### Task 13.1 � Gemini API Integration
- **Backend:** Installed `@google/genai`, built `aiService.ts` which injects DB Context (FAQs and Static Content for the user's organization) into a dynamic prompt. Exposed via `POST /api/ai/chat`.
- **Mobile App:** Created `ChatbotScreen.tsx` with a chat-like interface (messages, loading states). Accessible via a new Floating Action Button on the `HomeScreen`.



### Task 13.2 � Migrate from Gemini to Local Ollama
- **Backend:** Uninstalled `@google/genai` and switched `aiService.ts` to use `axios` to query a local Ollama instance (`http://localhost:11434/api/generate`) using the `doomgrave/gemma3` model.



## Phase 17: Production Readiness & CI/CD — ✅ COMPLETED
**Date:** 2026-02-27

### Task 17.1 — Security Hardening
- **Backend:** Installed helmet and express-rate-limit. Applied helmet and a general rate limiter to /api, and a strict rate limiter to /api/auth/login and /api/auth/password.

### Task 17.2 — Error Tracking (Sentry)
- **Backend:** Installed @sentry/node and @sentry/profiling-node, initialized Sentry at the top of server.ts, and added Sentry error handlers.
- **Mobile App:** Installed @sentry/react-native, initialized Sentry in App.tsx, and wrapped the root component.

### Task 17.3 — Database Indexing & Performance
- **Database:** Added @index to heavily queried Prisma fields (e.g., unitType, status, dueDate, apartmentId, organizationId) across various models (Apartment, Invoice, Ticket, Notification, FinancialTransaction, Contact, Faq) to optimize query performance.
- **Migration:** Created and ran migration 20260227074429_optimize_indexes.

### Task 17.4 — CI/CD Pipeline Setup
- **GitHub Actions:** Created .github/workflows/main.yml to automatically checkout the code, install dependencies, type-check the backend (	sc --noEmit), and type-check the web-admin. Runs on push and pull_request to the main branch.
