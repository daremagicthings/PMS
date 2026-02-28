import { useEffect, useState } from 'react';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import { commentApi, userApi } from '../services/api';
import type { Ticket, TicketComment } from '../services/api';

const getImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    // Get base URL from Vite env or fallback
    let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    // Remove '/api' from the end if it exists
    base = base.replace(/\/api\/?$/, '');
    
    // Ensure url starts with a slash
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${base}${path}`;
};

interface TicketDetailModalProps {
    ticket: Ticket;
    onClose: () => void;
}

/**
 * Modal showing ticket details, attached image, and chat-like comment thread.
 * Admin can view full context and communicate with the resident.
 */
export default function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [adminUserId, setAdminUserId] = useState<string | null>(null);
    const [showLightbox, setShowLightbox] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await commentApi.getByTicket(ticket.id);
            setComments(res.data.data || []);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        // Fetch the admin user ID so we can post comments as the admin
        userApi.getAll().then((res) => {
            const users = res.data.data || [];
            const admin = users.find((u) => u.role === 'ADMIN') || users[0];
            if (admin) setAdminUserId(admin.id);
        }).catch((err) => console.error('Failed to load admin user:', err));
    }, [ticket.id]);

    const handleSend = async () => {
        if (!newComment.trim() || !adminUserId) return;
        setSending(true);
        try {
            await commentApi.create(ticket.id, {
                userId: adminUserId,
                content: newComment.trim(),
            });
            setNewComment('');
            await fetchComments();
        } catch (err) {
            console.error('Failed to send comment:', err);
            alert('Коммент илгээхэд алдаа гарлаа.');
        } finally {
            setSending(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'NEW': return 'Шинэ';
            case 'IN_PROGRESS': return 'Хийгдэж буй';
            case 'RESOLVED': return 'Шийдэгдсэн';
            default: return status;
        }
    };

    console.log('ticket.imageUrl is:', ticket.imageUrl);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-slate-800 truncate">{ticket.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor(ticket.status)}`}>
                                {statusLabel(ticket.status)}
                            </span>
                            <span className="text-xs text-slate-400">
                                {ticket.user?.name || 'Тодорхойгүй'} · {ticket.apartment ? `${ticket.apartment.buildingName} — ${ticket.apartment.unitNumber}` : '—'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Тайлбар</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Attached Image */}
                    {ticket.imageUrl && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                                <ImageIcon size={14} /> Хавсаргасан зураг
                            </h3>
                            <img
                                src={getImageUrl(ticket.imageUrl)}
                                alt="Хавсаргасан зураг"
                                className="max-w-full max-h-64 rounded-xl border border-slate-200 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setShowLightbox(true)}
                                title="Томсгож үзэх"
                            />
                        </div>
                    )}

                    {/* Comment thread */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 mb-3">
                            Сэтгэгдэл ({comments.length})
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">Сэтгэгдэл алга. Энд бичиж харилцааг эхлүүлнэ үү!</p>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((c) => {
                                    const isAdmin = c.user?.role === 'ADMIN';
                                    return (
                                        <div
                                            key={c.id}
                                            className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isAdmin
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-slate-100 text-slate-800 rounded-bl-md'
                                                }`}>
                                                <p className={`text-xs font-semibold mb-0.5 ${isAdmin ? 'text-blue-100' : 'text-slate-500'}`}>
                                                    {c.user?.name || 'Тодорхойгүй'}
                                                </p>
                                                <p className="text-sm leading-relaxed">{c.content}</p>
                                                <p className={`text-[10px] mt-1 ${isAdmin ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment input */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Зурвас бичих..."
                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !newComment.trim()}
                            className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Full-screen image lightbox */}
            {showLightbox && ticket.imageUrl && (
                <div
                    className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8 cursor-pointer"
                    onClick={() => setShowLightbox(false)}
                >
                    <img
                        src={getImageUrl(ticket.imageUrl)}
                        alt="Бүтэн зураг"
                        className="max-w-full max-h-full rounded-xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-light"
                        onClick={() => setShowLightbox(false)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
