# Product Requirements Document (PRD)
**Project Name:** Property Management System (СӨХ System)
**Version:** 1.0 (MVP)

## 1. Project Overview
The objective is to build a modern Property Management System to streamline daily operations for Property Managers (СӨХ) and improve transparency, communication, and fee collection for Residents. 

## 2. Target Audience & Roles
* **Admin (Property Manager):** Uses a Web-based Dashboard to manage data, finances, and communications.
* **Resident:** Uses a Mobile App to view invoices, make payments, submit requests, and stay informed.

## 3. Core Features (MVP Scope)

### 3.1. User & Property Management
* **Admin Web:** Add and manage buildings, entrances, floors, and apartments. Link residents to specific apartments.
* **Authentication:** Phone number or email-based login for both Admins and Residents.

### 3.2. Financial Transparency & Invoicing
* **Admin Web:** Generate monthly fee invoices (static amounts input manually or via bulk upload, no complex formula calculations for MVP). Mark invoices as Paid/Unpaid.
* **Resident Mobile:** View current balance on the home screen. View history of paid invoices. Future integration: Deep link to external payment apps (e.g., QPay).
* **Transparency:** Admin can publish monthly financial summary reports (e.g., income vs. expenses) for residents to view in the mobile app.

### 3.3. Ticketing / Request System
* **Resident Mobile:** Submit maintenance requests or complaints with a title, text description, and an optional image attachment. View the status of their tickets.
* **Admin Web:** View, manage, and update the status of tickets (New -> In Progress -> Resolved).

### 3.4. Communication & Meetings
* **Admin Web:** Create announcements, news, or meeting schedules. Can include external video call links (Google Meet/Zoom) for remote meetings.
* **Resident Mobile:** Receive notifications for new announcements. View scheduled meetings and click a button to join via the provided link.

## 4. Out of Scope for MVP
* Automated fee calculations based on square footage, resident count, etc.
* Direct payment processing within the app (relying on external deep links or manual verification first).
* Built-in video conferencing (using external links instead).