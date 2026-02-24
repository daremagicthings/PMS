import axios from 'axios';

/**
 * Centralized API client for the SOH System backend.
 * Constitution: Separate API fetching logic from UI components.
 */

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Axios request interceptor that attaches the JWT token from
 * localStorage to every outgoing request.
 */
api.interceptors.request.use((config) => {
    try {
        const stored = localStorage.getItem('soh_auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.token) {
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        }
    } catch (e) {
        console.error('Failed to attach auth token:', e);
    }
    return config;
});

// ─── Types ──────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface Apartment {
    id: string;
    buildingName: string;
    entrance: string;
    floor: number;
    unitNumber: string;
    residents?: User[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    role: 'ADMIN' | 'RESIDENT';
    apartmentId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    id: string;
    amount: number;
    description: string | null;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    dueDate: string;
    paidAt: string | null;
    apartmentId: string;
    apartment?: Pick<Apartment, 'id' | 'buildingName' | 'unitNumber' | 'entrance' | 'floor'>;
    createdAt: string;
    updatedAt: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
    userId: string;
    apartmentId: string;
    user?: Pick<User, 'id' | 'name' | 'phone'>;
    apartment?: Pick<Apartment, 'id' | 'buildingName' | 'unitNumber'>;
    _count?: { comments: number };
    createdAt: string;
    updatedAt: string;
}

export interface TicketComment {
    id: string;
    content: string;
    ticketId: string;
    userId: string;
    user?: { id: string; name: string; role: 'ADMIN' | 'RESIDENT' };
    createdAt: string;
    updatedAt: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    meetingLink: string | null;
    createdById: string;
    createdBy?: Pick<User, 'id' | 'name'>;
    createdAt: string;
    updatedAt: string;
}

export interface WorkPlan {
    id: string;
    title: string;
    description: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    expectedDate: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FinancialReport {
    id: string;
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    description: string | null;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── Auth ───────────────────────────────────────────────

export const authApi = {
    login: (phone: string, password: string) =>
        api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { phone, password }),
    changePassword: (oldPassword: string, newPassword: string) =>
        api.put<ApiResponse<void>>('/auth/password', { oldPassword, newPassword }),
};

// ─── Apartments ─────────────────────────────────────────

export const apartmentApi = {
    getAll: () => api.get<ApiResponse<Apartment[]>>('/apartments'),
    create: (data: { buildingName: string; entrance: string; floor: number; unitNumber: string }) =>
        api.post<ApiResponse<Apartment>>('/apartments', data),
};

// ─── Users ──────────────────────────────────────────────

export const userApi = {
    getAll: () => api.get<ApiResponse<User[]>>('/users'),
    create: (data: { name: string; phone: string; password: string; email?: string; role?: string; apartmentId?: string }) =>
        api.post<ApiResponse<User>>('/users', data),
};

// ─── Invoices ───────────────────────────────────────────

export const invoiceApi = {
    getAll: () => api.get<ApiResponse<Invoice[]>>('/invoices'),
    create: (data: { apartmentId: string; amount: number; description?: string; dueDate: string }) =>
        api.post<ApiResponse<Invoice>>('/invoices', data),
    markAsPaid: (id: string) => api.put<ApiResponse<Invoice>>(`/invoices/${id}/pay`),
};

// ─── Tickets ────────────────────────────────────────────

export const ticketApi = {
    getAll: () => api.get<ApiResponse<Ticket[]>>('/tickets'),
    create: (data: { userId: string; apartmentId: string; title: string; description: string; imageUrl?: string }) =>
        api.post<ApiResponse<Ticket>>('/tickets', data),
    updateStatus: (id: string, status: string) =>
        api.put<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status }),
};

// ─── Ticket Comments ────────────────────────────────────

export const commentApi = {
    getByTicket: (ticketId: string) =>
        api.get<ApiResponse<TicketComment[]>>(`/tickets/${ticketId}/comments`),
    create: (ticketId: string, data: { userId: string; content: string }) =>
        api.post<ApiResponse<TicketComment>>(`/tickets/${ticketId}/comments`, data),
};

// ─── Announcements ──────────────────────────────────────

export const announcementApi = {
    getAll: () => api.get<ApiResponse<Announcement[]>>('/announcements'),
    create: (data: { title: string; content: string; meetingLink?: string; createdById: string }) =>
        api.post<ApiResponse<Announcement>>('/announcements', data),
    update: (id: string, data: { title?: string; content?: string; meetingLink?: string | null }) =>
        api.put<ApiResponse<Announcement>>(`/announcements/${id}`, data),
    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/announcements/${id}`),
};

// ─── Work Plans ─────────────────────────────────────────

export const workPlanApi = {
    getAll: () => api.get<ApiResponse<WorkPlan[]>>('/work-plans'),
    create: (formData: FormData) =>
        api.post<ApiResponse<WorkPlan>>('/work-plans', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, formData: FormData) =>
        api.put<ApiResponse<WorkPlan>>(`/work-plans/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/work-plans/${id}`),
};

// ─── Financial Reports ──────────────────────────────────

export const financialReportApi = {
    getAll: () => api.get<ApiResponse<FinancialReport[]>>('/financial-reports'),
    create: (formData: FormData) =>
        api.post<ApiResponse<FinancialReport>>('/financial-reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, formData: FormData) =>
        api.put<ApiResponse<FinancialReport>>(`/financial-reports/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/financial-reports/${id}`),
};

// ─── Notifications ──────────────────────────────────────

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'TICKET_UPDATE' | 'NEW_COMMENT' | 'INVOICE' | 'ANNOUNCEMENT' | 'SYSTEM';
    isRead: boolean;
    userId: string;
    createdAt: string;
}

export const notificationApi = {
    getAll: (userId: string) =>
        api.get<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>>(`/notifications?userId=${userId}`),
    markRead: (id: string) =>
        api.put<ApiResponse<AppNotification>>(`/notifications/${id}/read`),
    markAllRead: (userId: string) =>
        api.put<ApiResponse<{ updatedCount: number }>>(`/notifications/read-all?userId=${userId}`),
};

// ─── Polls (Digital Voting) ─────────────────────────────

export interface PollOption {
    id: string;
    text: string;
    pollId: string;
    _count: { votes: number };
    votes?: { user: { id: string; name: string } }[];
}

export interface Poll {
    id: string;
    title: string;
    description: string | null;
    status: 'ACTIVE' | 'CLOSED';
    endDate: string | null;
    options: PollOption[];
    _count: { votes: number };
    createdAt: string;
    updatedAt: string;
}

export interface CreatePollInput {
    title: string;
    description?: string;
    endDate?: string;
    options: string[];
}

export const pollApi = {
    getAll: () => api.get<ApiResponse<Poll[]>>('/polls'),
    create: (data: CreatePollInput) => api.post<ApiResponse<Poll>>('/polls', data),
    vote: (pollId: string, userId: string, optionId: string) =>
        api.post<ApiResponse<void>>(`/polls/${pollId}/vote`, { userId, optionId }),
    close: (pollId: string) => api.put<ApiResponse<Poll>>(`/polls/${pollId}/close`),
};

export default api;
