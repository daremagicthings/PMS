import { useEffect, useState } from 'react';
import type { FinancialReport, FinancialTransaction } from '../services/api';
import { financialReportApi, financialTransactionApi } from '../services/api';
import { BarChart3, Plus, X, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Financials() {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editReport, setEditReport] = useState<FinancialReport | null>(null);

    // Detail Drawer State
    const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [loadingTx, setLoadingTx] = useState(false);

    // Form state
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [totalIncome, setTotalIncome] = useState('');
    const [totalExpense, setTotalExpense] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Transaction Form State
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [txAmount, setTxAmount] = useState('');
    const [txReceiverSender, setTxReceiverSender] = useState('');
    const [txDescription, setTxDescription] = useState('');
    const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [submittingTx, setSubmittingTx] = useState(false);

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

    const fetchTransactions = async (reportId: string) => {
        setLoadingTx(true);
        try {
            const res = await financialTransactionApi.getByReport(reportId);
            if (res.data) setTransactions(res.data as any);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoadingTx(false);
        }
    };

    const handleSelectReport = (report: FinancialReport) => {
        setSelectedReport(report);
        fetchTransactions(report.id);
    };

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

    const openEditModal = (report: FinancialReport, e: React.MouseEvent) => {
        e.stopPropagation();
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
        } catch (err: any) {
            if (err.response?.status === 409) {
                alert(`${year} оны ${MONTH_NAMES[month]}-р сарын тайлан аль хэдийн үүссэн байна.`);
            } else {
                alert('Санхүүгийн тайлан хадгалахад алдаа гарлаа');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Энэ тайланг устгахдаа итгэлтэй байна уу?')) return;
        try {
            await financialReportApi.delete(id);
            await fetchReports();
        } catch (err) {
            console.error('Failed to delete financial report:', err);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport || !txAmount || !txReceiverSender || !txDescription) return;
        setSubmittingTx(true);
        try {
            await financialTransactionApi.create({
                reportId: selectedReport.id,
                date: txDate,
                amount: Number(txAmount),
                receiverSender: txReceiverSender,
                description: txDescription,
                type: txType
            });
            setTxAmount('');
            setTxDescription('');
            setTxReceiverSender('');
            fetchTransactions(selectedReport.id);
        } catch (err) {
            console.error('Failed to add transaction', err);
            alert('Гүйлгээ нэмэхэд алдаа гарлаа');
        } finally {
            setSubmittingTx(false);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Энэ гүйлгээг устгах уу?')) return;
        try {
            await financialTransactionApi.delete(id);
            if (selectedReport) fetchTransactions(selectedReport.id);
        } catch (err) {
            console.error('Failed to delete transaction', err);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('mn-MN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + '₮';

    return (
        <div className="flex h-full">
            <div className={`flex-1 transition-all duration-300 ${selectedReport ? 'pr-6' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={28} className="text-emerald-600" />
                        <h1 className="text-2xl font-bold text-slate-800">Санхүүгийн тайлан</h1>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        <Plus size={18} /> Тайлан нэмэх
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-400">Уншиж байна...</p>
                ) : reports.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <BarChart3 size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-400">Санхүүгийн тайлан олдсонгүй. 'Тайлан нэмэх' дээр дарж эхэлнэ үү.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => handleSelectReport(report)}
                                className={`bg-white rounded-xl border p-5 flex items-start gap-5 cursor-pointer transition-shadow hover:shadow-md ${selectedReport?.id === report.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}
                            >
                                {/* Left: Image if exists */}
                                {report.imageUrl && (
                                    <img
                                        src={report.imageUrl.startsWith('http') ? report.imageUrl : `${API_ROOT}${report.imageUrl.startsWith('/') ? '' : '/'}${report.imageUrl}`}
                                        alt="receipt"
                                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                    />
                                )}

                                {/* Center: Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg">
                                        {report.year} оны {MONTH_NAMES[report.month]}-р сар
                                    </h3>
                                    {report.description && (
                                        <p className="text-sm text-slate-500 mt-1 truncate">{report.description}</p>
                                    )}
                                    <div className="flex gap-6 mt-3">
                                        <div>
                                            <span className="text-xs text-slate-400 uppercase font-medium">Орлого</span>
                                            <p className="text-lg font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 uppercase font-medium">Зарлага</span>
                                            <p className="text-lg font-bold text-red-500">{formatCurrency(report.totalExpense)}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-400 uppercase font-medium">Үлдэгдэл</span>
                                            <p className={`text-lg font-bold ${report.totalIncome - report.totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {formatCurrency(report.totalIncome - report.totalExpense)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={(e) => openEditModal(report, e)}
                                        className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors"
                                        title="Засах"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(report.id, e)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                                        title="Устгах"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Drawer (Right Side) */}
            {selectedReport && (
                <div className="w-[450px] bg-white border-l border-slate-200 h-[calc(100vh-80px)] fixed right-0 top-[80px] shadow-2xl flex flex-col z-40 animate-in slide-in-from-right">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ArrowRightLeft size={18} className="text-emerald-600" />
                                {selectedReport.year} оны {MONTH_NAMES[selectedReport.month]}-р сар - Гүйлгээнүүд
                            </h2>
                        </div>
                        <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700 bg-white rounded-full p-1 border">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                        {/* Transaction List */}
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Гүйлгээний жагсаалт</h3>
                        {loadingTx ? (
                            <p className="text-sm text-slate-400 text-center py-4">Уншиж байна...</p>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 bg-white border border-dashed rounded-lg mb-6">
                                <p className="text-sm text-slate-400">Бүртгэгдсэн гүйлгээ алга.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-8">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tx.type === 'INCOME' ? 'Орлого' : 'Зарлага'}
                                                </span>
                                                <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-800">{tx.description}</p>
                                            <p className="text-xs text-slate-500">{tx.receiverSender}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                            <button onClick={() => handleDeleteTransaction(tx.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Form */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4">Шинэ гүйлгээ нэмэх</h3>
                            <form onSubmit={handleAddTransaction} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Төрөл</label>
                                        <select
                                            value={txType}
                                            onChange={(e) => setTxType(e.target.value as any)}
                                            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                                        >
                                            <option value="INCOME">Орлого (+)</option>
                                            <option value="EXPENSE">Зарлага (-)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Огноо</label>
                                        <input
                                            type="date"
                                            value={txDate}
                                            onChange={(e) => setTxDate(e.target.value)}
                                            required
                                            className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Дүн (₮)</label>
                                    <input
                                        type="number"
                                        value={txAmount}
                                        onChange={(e) => setTxAmount(e.target.value)}
                                        required
                                        placeholder="0"
                                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{txType === 'INCOME' ? 'Илгээгч' : 'Хүлээн авагч'}</label>
                                    <input
                                        type="text"
                                        value={txReceiverSender}
                                        onChange={(e) => setTxReceiverSender(e.target.value)}
                                        required
                                        placeholder="Жнь: Хаан банк, Гүйцэтгэгч..."
                                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Гүйлгээний утга</label>
                                    <input
                                        type="text"
                                        value={txDescription}
                                        onChange={(e) => setTxDescription(e.target.value)}
                                        required
                                        placeholder="Жнь: Сарын хураамж"
                                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingTx}
                                    className="w-full mt-2 bg-emerald-600 text-white rounded-md py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {submittingTx ? 'Нэмж байна...' : 'Гүйлгээ нэмэх'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal (Main Report) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editReport ? 'Санхүүгийн тайлан засах' : 'Санхүүгийн тайлан нэмэх'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Сар</label>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(Number(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        {MONTH_NAMES.slice(1).map((name, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}-р сар</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Жил</label>
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
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Нийт орлого (₮)</label>
                                    <input
                                        type="number"
                                        value={totalIncome}
                                        onChange={(e) => setTotalIncome(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Нийт зарлага (₮)</label>
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
                                <label className="block text-sm font-medium text-slate-600 mb-1">Тайлбар (заавал биш)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    placeholder="Тайлангийн хураангуй..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Баримт / Графикийн зураг (заавал биш)</label>
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
                                Цуцлах
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !totalIncome || !totalExpense}
                                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Хадгалж байна...' : editReport ? 'Шинэчлэх' : 'Үүсгэх'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
