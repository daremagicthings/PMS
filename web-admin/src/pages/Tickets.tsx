import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../services/api';
import type { Ticket } from '../services/api';
import TicketDetailModal from '../components/TicketDetailModal';
import { useLocation, useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
const STATUS_LABELS: Record<string, string> = {
    'NEW': 'Шинэ',
    'IN_PROGRESS': 'Хийгдэж буй',
    'RESOLVED': 'Шийдэгдсэн'
};

type FilterStatus = 'ALL' | 'PENDING' | 'RESOLVED';

/**
 * Tickets page — table with status dropdown for admin to update ticket progress.
 * Clicking a row opens a detail modal with image and comment thread.
 */
export default function Tickets() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

    const { data: tickets = [], isLoading, isError, error } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            const res = await ticketApi.getAll();
            return res.data.data || [];
        },
    });

    // Handle incoming search highlight
    useEffect(() => {
        if (location.state?.highlightTicketId && tickets.length > 0) {
            const t = tickets.find(x => x.id === location.state.highlightTicketId);
            if (t) {
                setSelectedTicket(t);
                // Reset state so it doesn't reopen on refresh
                navigate('.', { replace: true, state: {} });
            }
        }
    }, [location.state, tickets, navigate]);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => ticketApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (err) => {
            console.error('Update status error:', err);
            alert('Failed to update ticket status.');
        }
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        updateStatusMutation.mutate({ id, status: newStatus });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (isError) {
        return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium">⚠️ {(error as Error).message || 'Failed to load tickets'}</div>;
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'border-blue-300 bg-blue-50 text-blue-700';
            case 'IN_PROGRESS': return 'border-amber-300 bg-amber-50 text-amber-700';
            case 'RESOLVED': return 'border-emerald-300 bg-emerald-50 text-emerald-700';
            default: return 'border-slate-300 bg-slate-50 text-slate-700';
        }
    };

    const pendingCount = tickets.filter((t: Ticket) => t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
    const resolvedCount = tickets.filter((t: Ticket) => t.status === 'RESOLVED').length;

    const filteredTickets = tickets.filter((t: Ticket) => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'PENDING') return t.status === 'NEW' || t.status === 'IN_PROGRESS';
        if (filterStatus === 'RESOLVED') return t.status === 'RESOLVED';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                    Нийт {tickets.length} · {tickets.filter((t: Ticket) => t.status === 'NEW').length} шинэ · {tickets.filter((t: Ticket) => t.status === 'IN_PROGRESS').length} хийгдэж буй
                </p>

                <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            filterStatus === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Бүгд
                    </button>
                    <button
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                            filterStatus === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-amber-600'
                        }`}
                    >
                        Хүлээгдэж байгаа
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterStatus === 'PENDING' ? 'bg-white/20' : 'bg-slate-200'}`}>
                            {pendingCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setFilterStatus('RESOLVED')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                            filterStatus === 'RESOLVED' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-emerald-600'
                        }`}
                    >
                        Шийдсэн
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterStatus === 'RESOLVED' ? 'bg-white/20' : 'bg-slate-200'}`}>
                            {resolvedCount}
                        </span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Гарчиг</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Илгээсэн</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Орон сууц</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">💬</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Огноо</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">Төлөв</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTickets.map((t: Ticket) => (
                            <tr
                                key={t.id}
                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedTicket?.id === t.id ? 'bg-blue-50/50' : ''}`}
                                onClick={() => setSelectedTicket(t)}
                            >
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-800">{t.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{t.user?.name || '—'}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {t.apartment ? `${t.apartment.buildingName} — ${t.apartment.unitNumber}` : '—'}
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600 text-sm">
                                    {t._count?.comments || 0}
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-xs">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={t.status}
                                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${statusColor(t.status)}`}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {filteredTickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Санал гомдол олдсонгүй</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </div>
    );
}

