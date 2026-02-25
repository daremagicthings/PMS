# Development Tasks / Backlog

This file tracks the step-by-step development tasks. The AI Agent must pick tasks sequentially and check them off `[x]` when fully implemented and tested.

## Phase 1: Foundation (Backend & Database)
- [x] **Task 1.1:** Initialize `/backend` folder with Node.js, TypeScript, and Express.
- [x] **Task 1.2:** Create `docker-compose.yml` for PostgreSQL database.
- [x] **Task 1.3:** Set up Prisma ORM, define the schema (Users, Apartments, Invoices, Tickets, Announcements), and run the initial migration.
- [x] **Task 1.4:** Create the folder structure matching the Clean Architecture (`routes`, `controllers`, `services`, `middlewares`).

## Phase 2: Core APIs
- [x] **Task 2.1:** Implement Auth APIs (Login/Register mock).
- [x] **Task 2.2:** Implement Apartment & User management APIs (CRUD).
- [x] **Task 2.3:** Implement Invoice generation and payment status APIs.
- [x] **Task 2.4:** Implement Ticket management APIs (Resident submits, Admin updates).
- [x] **Task 2.5:** Implement Announcement APIs.

## Phase 3: Admin Web App (React)
- [x] **Task 3.1:** Initialize `/web-admin` with Vite (React) + TypeScript + Tailwind CSS.
- [x] **Task 3.2:** Build Layout & Navigation (Sidebar, Header).
- [x] **Task 3.3:** Build Dashboard (Stats overview).
- [x] **Task 3.4:** Build Residents/Apartment Management page.
- [x] **Task 3.5:** Build Finances/Invoices page.
- [x] **Task 3.6:** Build Tickets Kanban/Table page.

## Phase 4: Resident Mobile App (React Native)
- [x] **Task 4.1:** Initialize `/mobile-app` with Expo + TypeScript.
- [x] **Task 4.2:** Build Login & Auth context (simple phone/password form) with mock API.
- [x] **Task 4.3:** Build Home Tab (Invoice summary, "Pay Now" dummy button).
- [x] **Task 4.4:** Build Tickets & Announcements tabs.

## Phase 5: Enhanced Ticketing & Analytics
- [x] **Task 5.1:** Update Database Schema: Add `TicketComment` model (relations to Ticket, User). Update Prisma schema and run migration.
- [x] **Task 5.2:** Ticket File Uploads: Implement image upload functionality for Tickets (using `multer` for local static storage). Update Mobile App to pick images and Admin Web to view them.
- [x] **Task 5.3:** Ticket Comments API & UI: Create endpoints for adding/viewing comments on a ticket. Update Admin Web and Mobile App to display a chat-like comment thread per ticket.
- [x] **Task 5.4:** Advanced Analytics: Update Admin Dashboard with charts (e.g., Recharts) showing ticket resolution metrics, total revenue vs unpaid, and apartment stats.

## Phase 6: Notifications, Account & UX
- [x] **Task 6.1:** Notification System: Add `Notification` model, create CRUD service/controller/routes. Auto-notify on ticket creation, status change, comments, and announcements.
- [x] **Task 6.2:** Announcements Full CRUD: Add edit (PUT) and delete (DELETE) endpoints. Rebuild web-admin Announcements page with create form, inline edit, and delete with confirmation.
- [x] **Task 6.3:** Notification UI (Web Admin): Build `NotificationDropdown` with bell icon, unread badge, polling, mark-all-read, and click-to-navigate by type.
- [x] **Task 6.4:** Account Screen: Build mobile `AccountScreen` with profile card, logout. Add web-admin `/account` route.
- [x] **Task 6.5:** Mobile Navigation Restructure: Remove Notifications tab, add `HeaderBell` to all tab headers, switch to `@react-navigation/stack`, notification tap navigates to relevant content.
- [x] **Task 6.6:** UX Polish: Image lightbox in `TicketDetailModal`, comment counts in ticket table and mobile cards.

## Phase 6: Transparency & Reporting (Шилэн СӨХ)
- [x] **Task 6.1:** Update Database Schema: Add `WorkPlan` model (Title, description, status: Planned/InProgress/Completed, date, imageUrl) and `FinancialReport` model (Month, year, totalIncome, totalExpense, description, imageUrl). Run migration.
- [x] **Task 6.2:** Backend APIs: Create CRUD endpoints for `WorkPlan` and `FinancialReport`.
- [x] **Task 6.3:** Admin Web UI: Create "Work Plans" page to manage tasks and "Financial Reports" page to input monthly summaries and attach receipt images.
- [x] **Task 6.4:** Resident Mobile UI: Create a "Transparency" (Шилэн СӨХ) screen/tab where residents can view ongoing/completed work and monthly financial summaries.

## Phase 7: QPay & Password Change
- [x] **Task 7.1:** QPay Integration: Generate deep links/QR codes on Mobile and handle payment success webhooks on Backend.
- [x] **Task 7.2:** Push Notifications: Expo push notifications via `expo-server-sdk` (backend) and `expo-notifications` (mobile) with auto-push on notification creation.
- [x] **Task 7.4:** Password Change: Implement backend endpoint for changing user passwords with JWT auth middleware, integrate into web-admin and mobile.

## Phase 8: Digital Voting & E-Barimt
- [x] **Task 8.1:** Digital Voting: Add `Poll`, `PollOption`, `PollVote` models. Create poll CRUD + voting APIs. Build web-admin Polls page with Recharts bar charts. Build mobile PollsScreen with elderly-friendly radio voting UI.
- [x] **Task 8.2:** E-Barimt Mock Integration: Add E-Barimt fields to Invoice. Auto-generate mock E-Barimt on QPay payment. GET endpoint for E-Barimt data. Mobile E-Barimt modal on HomeScreen with receipt ID, lottery, and QR code.

## Phase 9: AI (Upcoming)
- [ ] **Task 9.1:** AI Chatbot: Integrate a smart assistant on the Mobile app to answer common resident questions automatically.

# Development Tasks / Backlog

This file tracks the step-by-step development tasks. The AI Agent must pick tasks sequentially and check them off `[x]` when fully implemented and tested.

## Phase 1 to Phase 8: Foundation to E-Barimt
- [x] Foundation, Core APIs, Web Admin, Mobile App, Ticketing, Analytics, Transparency, QPay, Password Change, Voting, and E-Barimt are all COMPLETE.

## Phase 9: UX/UI Refactoring (Дизайн сайжруулалт)
- [x] **Task 9.1:** Bottom Navigation Restructure: Reduce from 6 tabs to 4 tabs (Нүүр, Хүсэлт, Мэдээ, Шилэн СӨХ). Combine "Зарлал" and "Санал" into a Material Top Tab Navigator under "Мэдээ".
- [x] **Task 9.2:** Profile Relocation: Remove "Бүртгэл" from bottom tabs. Add a User Avatar icon to the top-right header of the Home screen that opens the Account modal/screen.
- [x] **Task 9.3:** Image & Card Polish: Fix squished images in the "Шилэн СӨХ" screen (use `resizeMode: "cover"` and correct aspect ratios). Add soft shadows and rounded corners (12px or 16px) to all cards for a modern look.

## Phase 10: Advanced Lease & Property Management (Түрээс ба Талбай)
- [x] **Task 10.1:** Unit Types: Update `Apartment` model in Prisma to support `unitType` (APARTMENT, MUSAR, BASEMENT). Add lease fields: `leaseStartDate`, `leaseEndDate`, `contractId`. 
- [x] **Task 10.2:** Owner vs Tenant: Update `Apartment` model to have both `ownerId` and `tenantId`. 
- [x] **Task 10.3:** Web Admin UI: Update "Residents" page with Tabs to visually separate "Apartments" and "Leased Spaces". Add forms to manage lease dates and assign both owner and tenant.

## Phase 11: Advanced Billing & Penalties (Төлбөр ба Алданги)
- [x] **Task 11.1:** Dual Visibility: Update `GET /api/invoices` so BOTH the owner and the tenant can see the invoices for their linked apartment on their mobile apps.
- [x] **Task 11.2:** Late Penalties (Алданги): Add `penaltyAmount` to the `Invoice` model. Create an endpoint to calculate/add penalties for past-due invoices.
- [x] **Task 11.3:** Mobile UI Breakdown: Display the penalty amount clearly in red on the Mobile App's Home screen and Invoice details.

## Phase 12: Operations, Vehicles & Content (Үйл ажиллагаа ба Мэдээлэл)
- [x] **Task 12.1:** Vehicle Registry: Add a `Vehicle` model (licensePlate, make/model) linked to `Apartment`. Create Web Admin UI to search and manage vehicles (crucial for parking disputes).
- [x] **Task 12.2:** Categorized Work Plans: Update `WorkPlan` model with a `category` enum (REGULAR, SCHEDULED, AD_HOC). Update Web Admin UI to filter tasks by these tabs.
- [x] **Task 12.3:** Mobile Static Content: Add menu items in the Account section for "СӨХ-ийн дүрэм журам" (Rules), "Түгээмэл асуултууд" (FAQ), and "Лавлагаа" (Inquiries) with clean text UI.

## Phase 13: AI Chatbot (Upcoming)
- [ ] **Task 13.1:** Integrate Gemini API for smart resident assistance.

## Phase 14: Mobile App UX/UI & Resident Features
- [ ] **Task 14.1:** Multi-Property Management: Backend `GET /api/apartments/my-apartments` to fetch all properties linked to the user. Mobile App `HomeScreen` carousel to switch between properties and filter invoices/tickets.
- [ ] **Task 14.2:** Bulk Invoice Payment & Breakdown: Mobile checkboxes for unpaid invoices, floating "Pay Total" button. Expandable invoice breakdown UI. Backend `POST /api/invoices/qpay-bulk` to handle multiple invoices.
- [ ] **Task 14.3:** Corporate vs Citizen E-Barimt: Add `ebarimtType` and `ebarimtRegNo` to `User` model. Create API to update. Add settings UI in Mobile `AccountScreen`.
- [ ] **Task 14.4:** Tickets UI Polish: Top tabs (New, Resolved, Cancelled) and a Floating Action Button (FAB) for new tickets in Mobile App.
- [ ] **Task 14.5:** Contacts Directory: `ContactDirectory` model + CRUD. Web Admin page to manage. Mobile App screen to view and call numbers.

## Phase 15: Advanced Admin Operations & Accounting
- [ ] **Task 15.1:** Expanded Unit Types: Add PARKING, STORAGE to `unitType`. Add `parentApartmentId`. Web admin UI updates.
- [ ] **Task 15.2:** Excel Import for Bulk Invoicing: `POST /api/invoices/bulk-import` to parse `.xlsx` and create invoices. Web Admin dropzone UI.
- [ ] **Task 15.3:** Manual Bank Statement Reconciliation: `BankStatement` model. Excel upload. Split-screen Web Admin UI to match un-matched bank transfers with unpaid invoices.
- [ ] **Task 15.4:** Detailed Transaction Transparency: `FinancialTransaction` model linked to Monthly Reports. Mobile timeline view.
- [ ] **Task 15.5:** Downloadable PDF Reports: Generate PDF for monthly financial transparency.
- [ ] **Task 15.6:** Advanced Invoice Management (Export & Filter): Update Web Admin `Invoices` page with advanced filtering (Paid/Pending/Overdue, Date Range) and an "Export to Excel" (`xlsx` download) feature for accountants.