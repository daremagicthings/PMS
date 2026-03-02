# System Architecture
**Project:** Property Management System (СӨХ System)



## 1. High-Level Architecture
The system follows a standard 3-tier Client-Server architecture.
* **Database Tier:** PostgreSQL database storing all relational data.
* **Backend Tier (API):** A Node.js/Express server providing RESTful APIs. It handles business logic, authentication, and database interactions using Prisma ORM.
* **Client Tier (Frontends):**
    * **Admin Web App:** A single-page application (SPA) for property managers.
    * **Resident Mobile App:** A cross-platform mobile application for residents.

## 2. Directory Structure
The project will be organized into a centralized directory with three main folders to keep the contexts separate for the AI Agent:

/soh-system
  /backend     # Node.js, Express, Prisma
  /web-admin   # React.js (Vite), Tailwind CSS
  /mobile-app  # React Native (Expo)
  /docs        # PRD, Architecture, API, etc.