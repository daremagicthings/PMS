import { useEffect, useState } from 'react';
import { ticketApi } from '../services/api';
import type { Ticket } from '../services/api';
import TicketDetailModal from '../components/TicketDetailModal';

const STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
const STATUS_LABELS: Record<string, string> = {
    'NEW': 'Шинэ',
    'IN_PROGRESS': 'Хийгдэж буй',
    'RESOLVED': 'Шийдэгдсэн'
};

/**
 * Tickets page — table with status dropdown for admin to update ticket progress.
 * Clicking a row opens a detail modal with image and comment thread.
 */
export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const fetchTickets = async () => {
        try {
            const res = await ticketApi.getAll();
            setTickets(res.data.data || []);
        } catch (err) {
            console.error('Tickets fetch error:', err);
            setError('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await ticketApi.updateStatus(id, newStatus);
            await fetchTickets();
        } catch (err) {
            console.error('Update status error:', err);
            alert('Failed to update ticket status.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium">⚠️ {error}</div>;
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'border-blue-300 bg-blue-50 text-blue-700';
            case 'IN_PROGRESS': return 'border-amber-300 bg-amber-50 text-amber-700';
            case 'RESOLVED': return 'border-emerald-300 bg-emerald-50 text-emerald-700';
            default: return 'border-slate-300 bg-slate-50 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500">
                Нийт {tickets.length} · {tickets.filter(t => t.status === 'NEW').length} шинэ · {tickets.filter(t => t.status === 'IN_PROGRESS').length} хийгдэж буй
            </p>

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
                        {tickets.map((t) => (
                            <tr
                                key={t.id}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
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
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {tickets.length === 0 && (
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
