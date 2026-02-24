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
