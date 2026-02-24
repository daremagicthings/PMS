# REST API Endpoints
Base URL: `http://localhost:5000/api`

## Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

**Response:**
```json
{ "success": true, "message": "SOH System API is running", "data": { "uptime": 123.45 } }
```

---

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate and return JWT token |

**Request Body:**
```json
{ "phone": "99001122", "password": "mypassword" }
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "uuid", "name": "John", "phone": "99001122", "email": null, "role": "RESIDENT" }
  }
}
```

**Error Response (401):**
```json
{ "success": false, "message": "Invalid phone number or password" }
```

---

## Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Create a new user/resident |
| `GET` | `/users` | List all users (Admin) |

**POST `/users` Request Body:**
```json
{
  "name": "John Doe",
  "phone": "99001122",
  "email": "john@example.com",
  "password": "mypassword",
  "role": "RESIDENT",
  "apartmentId": "uuid-of-apartment"
}
```
> `email`, `role`, `apartmentId` are optional. `role` defaults to `RESIDENT`.

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": "uuid", "name": "John Doe", "phone": "99001122", "email": "john@example.com", "role": "RESIDENT", "apartmentId": "uuid", "createdAt": "...", "updatedAt": "..." }
}
```

---

## Apartments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/apartments` | Create a new apartment |
| `GET` | `/apartments` | List all apartments with residents |

**POST `/apartments` Request Body:**
```json
{
  "buildingName": "Building A",
  "entrance": "1",
  "floor": 3,
  "unitNumber": "301"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Apartment created successfully",
  "data": { "id": "uuid", "buildingName": "Building A", "entrance": "1", "floor": 3, "unitNumber": "301", "createdAt": "...", "updatedAt": "..." }
}
```

**GET `/apartments` Response** includes `residents` array with each apartment.

---

## Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/invoices` | Admin creates a new invoice |
| `GET` | `/invoices` | List all invoices with apartment info |
| `PUT` | `/invoices/:id/pay` | Mark invoice as PAID |

**POST `/invoices` Request Body:**
```json
{
  "apartmentId": "uuid-of-apartment",
  "amount": 150000,
  "description": "February 2026 monthly fee",
  "dueDate": "2026-02-28T00:00:00.000Z"
}
```

**PUT `/invoices/:id/pay`** — No body required. Updates status to `PAID` and sets `paidAt` timestamp.

**Error Responses:**
- `404` — Invoice not found
- `400` — Invoice already paid or cancelled

---

## Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets` | Resident creates a ticket |
| `GET` | `/tickets` | List all tickets with user/apartment info |
| `PUT` | `/tickets/:id/status` | Admin updates ticket status |

**POST `/tickets` Request Body:**
```json
{
  "userId": "uuid-of-user",
  "apartmentId": "uuid-of-apartment",
  "title": "Broken pipe in bathroom",
  "description": "Water is leaking from the pipe under the sink.",
  "imageUrl": "https://example.com/photo.jpg"
}
```
> `imageUrl` is optional.

**PUT `/tickets/:id/status` Request Body:**
```json
{ "status": "IN_PROGRESS" }
```
> Valid statuses: `NEW`, `IN_PROGRESS`, `RESOLVED`

---

## Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/announcements` | Admin creates announcement/meeting |
| `GET` | `/announcements` | List all announcements with creator info |

**POST `/announcements` Request Body:**
```json
{
  "title": "Monthly Meeting - March 2026",
  "content": "We will discuss the budget and upcoming repairs.",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "createdById": "uuid-of-admin-user"
}
```
> `meetingLink` is optional.

---

## Standard Error Response Format
All errors follow this shape (per Constitution.md):
```json
{ "success": false, "message": "Human-readable error description" }
```