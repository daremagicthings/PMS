# SOH SYSTEM - ENGINEERING CONSTITUTION
# MANDATORY RULES FOR DEVELOPMENT

> **Status:** ENFORCED

This document defines the strict constraints, architecture, and coding philosophies for the Property Management System (СӨХ) project. The AI Agent MUST read and adhere to these rules before writing any code.

## 1. The "Do No Harm" Protocol
* **Error Handling (Mandatory):** NEVER crash the server or the app. Every network request, database call, or complex logic MUST be wrapped in a `try/catch` block. 
* **Graceful Degradation:** If an error occurs, log the error clearly to the console and return a standardized, user-friendly JSON error response (e.g., `{ success: false, message: "Something went wrong" }`) with the appropriate HTTP status code.
* **Async Safety:** ALWAYS use `async/await` for asynchronous operations. Never use `.then().catch()` chains to prevent callback hell.

## 2. Code Standards & Typing
* **Strict Type Safety:** TypeScript is mandatory. Do not use `any`. Define strict interfaces/types for all payloads, database models, and function returns.
* **Documentation:** Functions and complex logic blocks must have JSDoc comments explaining parameters, expected behavior, and return types.

## 3. Clean Architecture (The "Golden" Rule)
* **Separation of Concerns:** The backend MUST strictly follow this flow: `Routes` -> `Controllers` -> `Services` -> `Database (Prisma)`.
* **No Direct DB Access in Controllers:** Controllers are ONLY responsible for receiving the HTTP request, validating inputs, calling the appropriate Service, and returning the HTTP response.
* **Business Logic Belongs in Services:** ALL business logic, calculations, and database calls MUST live inside the `services/` directory. Do NOT break this architecture.

## 4. Data Integrity & Lifecycle
* **Financial Data:** Invoice amounts and payment records are highly sensitive. Never hard-delete a paid invoice. Use status flags (e.g., `status: 'CANCELLED'`) instead of deletion.
* **Relational Integrity:** Rely on Prisma's foreign key constraints. If an Apartment is deleted (which should rarely happen), ensure associated Invoices and Tickets are handled properly (cascade delete or restrict).

## 5. UI/UX & Frontend Constraints
* **Admin Web App (React):** Keep the UI clean and professional. Use functional components and hooks. State should be managed cleanly (e.g., React Query for API state). 
* **Resident Mobile App (React Native):** Focus on extreme simplicity. The "Pay Now" and "Submit Ticket" actions must be prominent and require no more than 2-3 taps. Mobile UI must be responsive to different screen sizes.

## 6. Documentation Habits
* **Keep it Synced:** If you build a new API endpoint, update `docs/API.md`.
* **Track Progress:** Update `docs/Progress.md` after every completed feature.
* **Log Issues:** Any bugs found and fixed MUST be recorded in `docs/Troubleshooting.md` with the solution.