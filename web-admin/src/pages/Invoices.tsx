import { useEffect, useState } from 'react';
import { CheckCircle, Upload, Download, Search, Filter, X } from 'lucide-react';
import { invoiceApi } from '../services/api';
import type { Invoice } from '../services/api';
import * as xlsx from 'xlsx';

export default function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [unitSearch, setUnitSearch] = useState('');

    // Import Modal State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importSummary, setImportSummary] = useState<{ successCount: number; errorCount: number; errors: any[] } | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await invoiceApi.getAll({
                status: statusFilter,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            let data = res.data?.data || [];

            if (unitSearch) {
                data = data.filter(inv => inv.apartment?.unitNumber.toLowerCase().includes(unitSearch.toLowerCase()));
            }

            setInvoices(data);
            setError(null);
        } catch (err) {
            console.error('Invoices fetch error:', err);
            setError('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters (except local search) change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInvoices();
        }, 300); // debounce slightly
        return () => clearTimeout(timeoutId);
    }, [statusFilter, startDate, endDate, unitSearch]);

    const handleMarkAsPaid = async (id: string) => {
        try {
            await invoiceApi.markAsPaid(id);
            await fetchInvoices();
        } catch (err) {
            console.error('Mark as paid error:', err);
            alert('Failed to mark invoice as paid. It may already be paid or cancelled.');
        }
    };

    const handleExport = () => {
        if (invoices.length === 0) return alert('No data to export');
        const exportData = invoices.map(inv => {
            const residents = inv.apartment?.residents || [];
            const names = residents.map(r => r.name).join(', ') || '—';
            const phones = residents.map(r => r.phone).filter(Boolean).join(', ') || '—';

            return {
                Building: inv.apartment?.buildingName,
                Entrance: inv.apartment?.entrance,
                Unit: inv.apartment?.unitNumber,
                ResidentName: names,
                ResidentPhone: phones,
                Amount: inv.amount,
                Penalty: inv.penaltyAmount,
                Description: inv.description,
                DueDate: new Date(inv.dueDate).toISOString().split('T')[0],
                Status: inv.status,
                PaidAt: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : ''
            };
        });
        const ws = xlsx.utils.json_to_sheet(exportData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Invoices");
        xlsx.writeFile(wb, `Invoices_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadTemplate = () => {
        const ws = xlsx.utils.json_to_sheet([{
            buildingName: "A1",
            entrance: "1",
            unitNumber: "12",
            amount: 50000,
            description: "Monthly fee",
            dueDate: "2023-12-01"
        }]);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Template");
        xlsx.writeFile(wb, "Bulk_Import_Template.xlsx");
    };

    const handleImportSubmit = async () => {
        if (!importFile) return;
        setImporting(true);
        setImportSummary(null);
        try {
            const formData = new FormData();
            formData.append('image', importFile); // Matches uploadSingle middleware
            const res = await invoiceApi.bulkImport(formData);
            setImportSummary(res.data.data);
            await fetchInvoices();
        } catch (err: any) {
            console.error('Import error:', err);
            alert(err.response?.data?.message || 'Failed to import invoices');
        } finally {
            setImporting(false);
            setImportFile(null);
        }
    };

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-slate-500">Нийт {invoices.length} нэхэмжлэл</p>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Download size={16} /> Экспортлох
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Upload size={16} /> Багцаар оруулах
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-600">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Шүүлтүүр:</span>
                </div>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">Бүх төлөв</option>
                    <option value="PENDING">Хүлээгдэж буй</option>
                    <option value="PAID">Төлөгдсөн</option>
                    <option value="CANCELLED">Цуцлагдсан</option>
                </select>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-400 text-sm">хүртэл</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Тасалгааны дугаараар хайх..."
                        value={unitSearch}
                        onChange={e => setUnitSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium">⚠️ {error}</div>}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Орон сууц</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Оршин суугч</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Тайлбар</th>
                            <th className="text-right px-6 py-3 font-semibold text-slate-600">Дүн</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Төлөх огноо</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">Төлөв</th>
                            <th className="text-center px-6 py-3 font-semibold text-slate-600">Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => {
                            const residents = inv.apartment?.residents || [];
                            const names = residents.map(r => r.name).join(', ') || '—';
                            const phones = residents.map(r => r.phone).filter(Boolean).join(', ') || '—';

                            return (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {inv.apartment?.buildingName} — {inv.apartment?.unitNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900 font-medium">{names}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{phones}</div>
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
                                            {inv.status === 'PAID' ? 'Төлөгдсөн' : inv.status === 'PENDING' ? 'Хүлээгдэж буй' : inv.status === 'CANCELLED' ? 'Цуцлагдсан' : inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {inv.status === 'PENDING' ? (
                                            <button
                                                onClick={() => handleMarkAsPaid(inv.id)}
                                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                                            >
                                                <CheckCircle size={14} /> Төлсөн
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {invoices.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Нэхэмжлэл олдсонгүй</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="flex p-6 border-b border-slate-100 items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Нэхэмжлэл багцаар оруулах</h3>
                            <button onClick={() => { setShowImportModal(false); setImportSummary(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!importSummary ? (
                                <>
                                    <div className="text-sm text-slate-600">
                                        Нэхэмжлэл агуулсан Excel (.xlsx) файл оруулна уу. Загварын форматтай яг тохирч байгаа эсэхийг шалгана уу.
                                    </div>
                                    <button onClick={downloadTemplate} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                                        <Download size={14} /> Загвар татах
                                    </button>

                                    <div className="mt-4 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={e => setImportFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className={`mb-2 ${importFile ? 'text-blue-500' : 'text-slate-400'}`} size={32} />
                                        <span className="text-sm font-medium text-slate-700">
                                            {importFile ? importFile.name : 'Энд дарж эсвэл файлаа чирнэ үү'}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">Зөвхөн Excel формат</span>
                                    </div>

                                    <button
                                        onClick={handleImportSubmit}
                                        disabled={!importFile || importing}
                                        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {importing ? (
                                            <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> Оруулж байна...</>
                                        ) : 'Оруулж эхлэх'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <CheckCircle size={18} /> Оруулалт амжилттай
                                        </h4>
                                        <p className="mt-1 text-sm">{importSummary.successCount} нэхэмжлэлийг амжилттай орууллаа.</p>
                                    </div>

                                    {importSummary.errorCount > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                                            <h4 className="font-bold text-red-800 text-sm mb-2">{importSummary.errorCount} алдаа гарлаа:</h4>
                                            <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto pr-2">
                                                {importSummary.errors.map((err, i) => (
                                                    <li key={i}>Мөр {err.row}: {err.reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => { setShowImportModal(false); setImportSummary(null); }}
                                        className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors"
                                    >
                                        Хаах
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
