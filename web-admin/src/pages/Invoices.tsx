import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { invoiceApi } from '../services/api';
import type { Invoice } from '../services/api';

/**
 * Invoices page — table with status badges and "Mark as Paid" action.
 */
export default function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = async () => {
        try {
            const res = await invoiceApi.getAll();
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error('Invoices fetch error:', err);
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    const handleMarkAsPaid = async (id: string) => {
        try {
            await invoiceApi.markAsPaid(id);
            await fetchInvoices();
        } catch (err) {
            console.error('Mark as paid error:', err);
            alert('Failed to mark invoice as paid. It may already be paid or cancelled.');
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
            case 'PAID': return 'bg-emerald-100 text-emerald-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500">{invoices.length} total invoices</p>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Apartment</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Description</th>
                            <th className="text-right px-6 py-3 font-semibold text-slate-600">Amount</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Due Date</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">Status</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {inv.apartment?.buildingName} — {inv.apartment?.unitNumber}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{inv.description || '—'}</td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-800">
                                    ₮{inv.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date(inv.dueDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(inv.status)}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {inv.status === 'PENDING' ? (
                                        <button
                                            onClick={() => handleMarkAsPaid(inv.id)}
                                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                                        >
                                            <CheckCircle size={14} /> Mark Paid
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No invoices found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
