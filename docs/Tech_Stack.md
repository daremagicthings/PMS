# Technology Stack

## 1. Backend (API & Business Logic)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript (preferred for type safety) or JavaScript
* **ORM:** Prisma
* **Database:** PostgreSQL (running on Docker for local development)

## 2. Web Application (Admin Dashboard)
* **Framework:** React.js (using Vite for fast building)
* **Styling:** Tailwind CSS + shadcn/ui (or Material-UI) for clean components
* **State Management:** React Query (for API data fetching) or Zustand
* **Routing:** React Router

## 3. Mobile Application (Resident App)
* **Framework:** React Native
* **Toolchain:** Expo (for easy testing and building without native setup)
* **Styling:** NativeWind (Tailwind for React Native) or standard StyleSheet
* **Navigation:** React Navigation

## 4. Development & Deployment Tools
* **Local DB:** Docker Desktop (Windows 11)
* **IDE/AI:** Antigravity AI Agent IDE
* **Cloud (Future):** GCP Free Tier (Compute Engine for Backend) + Supabase (for hosted PostgreSQL)