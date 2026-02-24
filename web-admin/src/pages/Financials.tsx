import { useEffect, useState } from 'react';
import type { FinancialReport } from '../services/api';
import { financialReportApi } from '../services/api';
import { BarChart3, Plus, X, Pencil, Trash2 } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Admin page for managing monthly financial transparency reports.
 * CRUD with income/expense entry and optional receipt/chart image upload.
 */
export default function Financials() {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editReport, setEditReport] = useState<FinancialReport | null>(null);

    // Form state
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [totalIncome, setTotalIncome] = useState('');
    const [totalExpense, setTotalExpense] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchReports = async () => {
        try {
            const res = await financialReportApi.getAll();
            if (res.data.data) setReports(res.data.data);
        } catch (err) {
            console.error('Failed to fetch financial reports:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, []);

    const openCreateModal = () => {
        setEditReport(null);
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setTotalIncome('');
        setTotalExpense('');
        setDescription('');
        setImage(null);
        setShowModal(true);
    };

    const openEditModal = (report: FinancialReport) => {
        setEditReport(report);
        setMonth(report.month);
        setYear(report.year);
        setTotalIncome(String(report.totalIncome));
        setTotalExpense(String(report.totalExpense));
        setDescription(report.description || '');
        setImage(null);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!totalIncome || !totalExpense) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('month', String(month));
            fd.append('year', String(year));
            fd.append('totalIncome', totalIncome);
            fd.append('totalExpense', totalExpense);
            if (description) fd.append('description', description);
            if (image) fd.append('image', image);

            if (editReport) {
                await financialReportApi.update(editReport.id, fd);
            } else {
                await financialReportApi.create(fd);
            }
            setShowModal(false);
            await fetchReports();
        } catch (err: unknown) {
            console.error('Failed to save financial report:', err);
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 409) {
                alert(`A report for ${MONTH_NAMES[month]} ${year} already exists.`);
            } else {
                alert('Failed to save financial report');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this financial report?')) return;
        try {
            await financialReportApi.delete(id);
            await fetchReports();
        } catch (err) {
            console.error('Failed to delete financial report:', err);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('mn-MN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + '₮';

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BarChart3 size={28} className="text-emerald-600" />
                    <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                    <Plus size={18} /> Add Report
                </button>
            </div>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : reports.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <BarChart3 size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400">No financial reports yet. Click "Add Report" to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-5">
                            {/* Left: Image if exists */}
                            {report.imageUrl && (
                                <img
                                    src={`${API_ROOT}${report.imageUrl}`}
                                    alt="receipt"
                                    className="w-20 h-20 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                />
                            )}

                            {/* Center: Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {MONTH_NAMES[report.month]} {report.year}
                                </h3>
                                {report.description && (
                                    <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                                )}
                                <div className="flex gap-6 mt-3">
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-medium">Income</span>
                                        <p className="text-lg font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-medium">Expense</span>
                                        <p className="text-lg font-bold text-red-500">{formatCurrency(report.totalExpense)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase font-medium">Balance</span>
                                        <p className={`text-lg font-bold ${report.totalIncome - report.totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(report.totalIncome - report.totalExpense)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => openEditModal(report)}
                                    className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(report.id)}
                                    className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editReport ? 'Edit Financial Report' : 'Add Financial Report'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Month</label>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        {MONTH_NAMES.slice(1).map((name, i) => (
                                            <option key={i + 1} value={i + 1}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Total Income (₮)</label>
                                    <input
                                        type="number"
                                        value={totalIncome}
                                        onChange={(e) => setTotalIncome(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Total Expense (₮)</label>
                                    <input
                                        type="number"
                                        value={totalExpense}
                                        onChange={(e) => setTotalExpense(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Description (optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    placeholder="Summary of this month's financials..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Receipt / Chart Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !totalIncome || !totalExpense}
                                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Saving...' : editReport ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
