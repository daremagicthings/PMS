import React, { useEffect, useState } from 'react';
import { bankStatementApi, invoiceApi } from '../services/api';
import type { BankStatement, Invoice } from '../services/api';
import { Upload, RefreshCw, CheckCircle, Search } from 'lucide-react';

export default function Reconciliation() {
    const [statements, setStatements] = useState<BankStatement[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [autoMatching, setAutoMatching] = useState(false);

    const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [searchInvoice, setSearchInvoice] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stmtRes, invRes] = await Promise.all([
                bankStatementApi.getPending(),
                invoiceApi.getAll({ status: 'PENDING' }),
            ]);
            if (stmtRes.data.success) setStatements(stmtRes.data.data || []);
            if (invRes.data.success) setInvoices(invRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
            alert('Тулгалтын мэдээлэл уншихад алдаа гарлаа.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await bankStatementApi.upload(formData);
            if (res.data.success) {
                alert(`Амжилттай хууллаа. ${res.data.data?.successCount} мэдээлэл орлоо.`);
                fetchData();
            } else {
                alert(`Хуулахад алдаа гарлаа: ${res.data.message}`);
            }
        } catch (error: any) {
            alert(`Алдаа: ${error.message}`);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAutoMatch = async () => {
        setAutoMatching(true);
        try {
            const res = await bankStatementApi.autoMatch();
            if (res.data.success) {
                alert(`${res.data.data?.matchedCount} хуулгыг автоматаар тулгалаа!`);
                fetchData();
            } else {
                alert(`Автомат тулгалтад алдаа гарлаа: ${res.data.message}`);
            }
        } catch (error: any) {
            alert(`Алдаа: ${error.message}`);
        } finally {
            setAutoMatching(false);
        }
    };

    const handleManualMatch = async () => {
        if (!selectedStatementId || !selectedInvoiceId) return;

        try {
            const res = await bankStatementApi.manualMatch(selectedStatementId, selectedInvoiceId);
            if (res.data.success) {
                alert('Амжилттай тулгалаа!');
                setSelectedStatementId(null);
                setSelectedInvoiceId(null);
                fetchData();
            } else {
                alert(`Тулгахад алдаа гарлаа: ${res.data.message}`);
            }
        } catch (error: any) {
            alert(`Алдаа: ${error.message}`);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const aptStr = `${inv.apartment?.buildingName} ${inv.apartment?.unitNumber}`.toLowerCase();
        const amtStr = inv.amount.toString();
        const q = searchInvoice.toLowerCase();
        return aptStr.includes(q) || amtStr.includes(q);
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">Хуулга тулгах (Reconciliation)</h1>
                <div className="flex space-x-3">
                    <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors border border-slate-700">
                        <Upload size={18} />
                        <span>{uploading ? 'Уншиж байна...' : 'Хуулга оруулах (Excel)'}</span>
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <button
                        onClick={handleAutoMatch}
                        disabled={autoMatching}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={autoMatching ? 'animate-spin' : ''} />
                        <span>Автомат тулгах</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-slate-400 text-center py-10">Ачааллаж байна...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                    {/* LEFT PANEL: Bank Statements */}
                    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-200">Банкны хуулга (Хүлээгдэж буй)</h2>
                            <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">{statements.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {statements.length === 0 ? (
                                <p className="text-slate-400 text-center py-4 text-sm">Хуулга олдсонгүй</p>
                            ) : (
                                statements.map(stmt => (
                                    <div
                                        key={stmt.id}
                                        onClick={() => setSelectedStatementId(stmt.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedStatementId === stmt.id ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/50'}`}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-slate-400">{new Date(stmt.date).toLocaleDateString()}</span>
                                            <span className="font-bold text-emerald-400">₮{stmt.amount.toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 break-words">{stmt.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Pending Invoices */}
                    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="font-semibold text-slate-200">Төлөгдөөгүй Нэхэмжлэх</h2>
                                <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">{filteredInvoices.length}</span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Байр, тоот эсвэл үнийн дүн..."
                                    value={searchInvoice}
                                    onChange={(e) => setSearchInvoice(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filteredInvoices.length === 0 ? (
                                <p className="text-slate-400 text-center py-4 text-sm">Нэхэмжлэх олдсонгүй</p>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <div
                                        key={inv.id}
                                        onClick={() => setSelectedInvoiceId(inv.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border flex justify-between items-center ${selectedInvoiceId === inv.id ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/50'}`}
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-200">
                                                {inv.apartment?.buildingName}-{inv.apartment?.unitNumber}
                                            </p>
                                            <p className="text-xs text-slate-400">Сар: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className="font-bold text-rose-400">₮{inv.amount.toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING ACTION BAR FOR MATCHING */}
            {selectedStatementId && selectedInvoiceId && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-blue-500/50 shadow-2xl p-4 rounded-2xl flex items-center space-x-6 z-50">
                    <div className="text-sm text-slate-300">
                        <p>Сонгосон хуулга: <span className="font-bold text-white">₮{statements.find(s => s.id === selectedStatementId)?.amount.toLocaleString()}</span></p>
                        <p>Сонгосон нэхэмжлэх: <span className="font-bold text-white">₮{invoices.find(i => i.id === selectedInvoiceId)?.amount.toLocaleString()}</span></p>
                    </div>
                    <button
                        onClick={handleManualMatch}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-transform active:scale-95"
                    >
                        <CheckCircle size={18} />
                        <span>Тулгах & Төлөх</span>
                    </button>
                    <button onClick={() => { setSelectedStatementId(null); setSelectedInvoiceId(null); }} className="text-slate-400 hover:text-slate-200">
                        Болих
                    </button>
                </div>
            )}
        </div>
    );
}
