import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationApi, userApi } from '../services/api';
import type { AppNotification } from '../services/api';

/**
 * Notification bell icon with dropdown panel.
 * Shows unread count badge and recent notifications.
 * Clicking a notification marks it read and navigates to the related page.
 */
export default function NotificationDropdown() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [adminId, setAdminId] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Fetch admin user ID
    useEffect(() => {
        userApi.getAll().then((res) => {
            const users = res.data.data || [];
            const admin = users.find((u) => u.role === 'ADMIN') || users[0];
            if (admin) setAdminId(admin.id);
        }).catch(console.error);
    }, []);

    // Fetch notifications when panel opens or adminId changes
    useEffect(() => {
        if (!adminId) return;
        const fetchNotifs = async () => {
            try {
                const res = await notificationApi.getAll(adminId);
                if (res.data.data) {
                    setNotifications(res.data.data.notifications);
                    setUnreadCount(res.data.data.unreadCount);
                }
            } catch (err) {
                console.error('Failed to load notifications:', err);
            }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 15000); // poll every 15s
        return () => clearInterval(interval);
    }, [adminId]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkAllRead = async () => {
        if (!adminId) return;
        try {
            await notificationApi.markAllRead(adminId);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    /** Navigate to the relevant page based on notification type */
    const getRoute = (type: string): string => {
        switch (type) {
            case 'TICKET_UPDATE':
            case 'NEW_COMMENT':
                return '/tickets';
            case 'INVOICE':
                return '/invoices';
            case 'ANNOUNCEMENT':
                return '/announcements';
            default:
                return '/';
        }
    };

    const handleNotificationClick = async (n: AppNotification) => {
        // Mark as read
        if (!n.isRead) {
            try {
                await notificationApi.markRead(n.id);
                setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, isRead: true } : item));
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch (err) {
                console.error('Failed to mark read:', err);
            }
        }
        // Navigate to relevant page and close dropdown
        setOpen(false);
        navigate(getRoute(n.type));
    };

    const typeIcon = (type: string) => {
        switch (type) {
            case 'TICKET_UPDATE': return '🎫';
            case 'NEW_COMMENT': return '💬';
            case 'INVOICE': return '💰';
            case 'ANNOUNCEMENT': return '📢';
            default: return '🔔';
        }
    };

    const timeAgo = (dateStr: string) => {
        const now = Date.now();
        const diff = now - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <Bell size={20} className="text-slate-500" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-sm text-slate-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-tight ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="mt-1">
                                            <Check size={14} className="text-blue-400" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
