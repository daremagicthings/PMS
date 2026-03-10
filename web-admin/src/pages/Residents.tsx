import { useEffect, useState, useRef } from 'react';
import {
    Building2, Plus, Pencil, Home, Key, Calendar, FileText, User as UserIcon, Download, Upload
} from 'lucide-react';
import type { Apartment, User, ApiResponse } from '../services/api';
import { apartmentApi, userApi } from '../services/api';
import * as XLSX from 'xlsx';
import { useLocation, useNavigate } from 'react-router-dom';

type TabKey = 'apartments' | 'leased';

/** Unit type options */
const UNIT_TYPES = [
    { value: 'APARTMENT', label: '🏠 Орон сууц' },
    { value: 'LEASE', label: '🔑 Түрээс' },
    { value: 'MUSAR', label: '🏪 Мусар' },
    { value: 'BASEMENT', label: '🔧 Подвал' },
    { value: 'PARKING', label: '🚗 Граж' },
    { value: 'STORAGE', label: '📦 Агуулах' },
];

/** Empty form state */
const emptyForm = {
    buildingName: '', entrance: '', floor: 0, unitNumber: '',
    unitType: 'APARTMENT', ownerId: '', tenantId: '',
    leaseStartDate: '', leaseEndDate: '', contractId: '',
    parentApartmentId: '',
};

export default function Residents() {
    const location = useLocation();
    const navigate = useNavigate();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('apartments');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Fetch data ────────────────────────────────────────
    const fetchData = async () => {
        try {
            setLoading(true);
            const [aptRes, userRes] = await Promise.all([
                apartmentApi.getAll(),
                userApi.getAll(),
            ]);
            setApartments(aptRes.data.data ?? []);
            setUsers(userRes.data.data ?? []);
        } catch (e) {
            console.error('Failed to fetch data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Handle incoming search highlight
    useEffect(() => {
        if (!loading && location.state?.highlightApartmentId && apartments.length > 0) {
            const apt = apartments.find(a => a.id === location.state.highlightApartmentId);
            if (apt) {
                if (apt.unitType !== 'APARTMENT') setActiveTab('leased');
                openEditModal(apt);
                navigate('.', { replace: true, state: {} });
            }
        }
    }, [location.state, apartments, loading, navigate]);

    // ─── Filtered views ────────────────────────────────────
    const apartmentUnits = apartments.filter(a => a.unitType === 'APARTMENT');
    const leasedUnits = apartments.filter(a => a.unitType !== 'APARTMENT');

    // ─── Modal helpers ─────────────────────────────────────
    const openCreateModal = () => {
        setEditId(null);
        setForm({
            ...emptyForm,
            unitType: activeTab === 'leased' ? 'LEASE' : 'APARTMENT',
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (apt: any) => {
        setEditId(apt.id);
        setForm({
            buildingName: apt.buildingName,
            entrance: apt.entrance,
            floor: apt.floor,
            unitNumber: apt.unitNumber,
            unitType: apt.unitType,
            ownerId: apt.ownerId ?? '',
            tenantId: apt.tenantId ?? '',
            leaseStartDate: apt.leaseStartDate ? apt.leaseStartDate.slice(0, 10) : '',
            leaseEndDate: apt.leaseEndDate ? apt.leaseEndDate.slice(0, 10) : '',
            contractId: apt.contractId ?? '',
            parentApartmentId: apt.parentApartmentId ?? '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.buildingName || !form.entrance || !form.unitNumber) {
            setError('Барилга, орц, тасалгааны дугаар заавал оруулна');
            return;
        }

        setSaving(true);
        setError('');
        try {
            const payload = {
                buildingName: form.buildingName,
                entrance: form.entrance,
                floor: Number(form.floor),
                unitNumber: form.unitNumber,
                unitType: form.unitType,
                ownerId: form.ownerId || undefined,
                tenantId: form.tenantId || undefined,
                leaseStartDate: form.leaseStartDate || undefined,
                leaseEndDate: form.leaseEndDate || undefined,
                contractId: form.contractId || undefined,
                parentApartmentId: form.parentApartmentId || undefined,
            };

            if (editId) {
                await apartmentApi.update(editId, payload);
            } else {
                await apartmentApi.create(payload as Parameters<typeof apartmentApi.create>[0]);
            }

            setShowModal(false);
            fetchData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: ApiResponse<void> } };
            setError(err.response?.data?.message || 'Алдаа гарлаа');
        } finally {
            setSaving(false);
        }
    };

    // ─── Excel Import/Export ───────────────────────────────
    const handleExport = () => {
        const wsData = users.map(u => ({
            Name: u.name,
            Phone: u.phone,
            Email: u.email || '',
            Role: u.role,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Residents');
        XLSX.writeFile(wb, 'Residents.xlsx');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                setLoading(true);
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<any>(ws);

                for (const row of data) {
                    if (row.Name && row.Phone) {
                        try {
                            await userApi.create({
                                name: row.Name,
                                phone: String(row.Phone),
                                password: 'password123', // default password
                                email: row.Email || undefined,
                                role: row.Role || 'RESIDENT',
                            });
                        } catch (err) {
                            console.error(`Failed to import user ${row.Name}:`, err);
                        }
                    }
                }
                alert('Импорт амжилттай дууслаа');
                fetchData();
            } catch (err) {
                console.error(err);
                alert('Импорт хийх үед алдаа гарлаа');
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    // ─── User name resolver ────────────────────────────────
    const getUserName = (id: string | null): string => {
        if (!id) return '—';
        const u = users.find(u => u.id === id);
        return u ? u.name : id.slice(0, 8) + '…';
    };

    // ─── Tab data ──────────────────────────────────────────
    const displayData = activeTab === 'apartments' ? apartmentUnits : leasedUnits;
    const isLeaseTab = activeTab === 'leased';

    // ─── Render ────────────────────────────────────────────
    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="text-blue-600" size={28} />
                    <h1 className="text-2xl font-bold text-slate-900">Оршин суугчид</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                        <Download size={18} />
                        Excel-р татах
                    </button>
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImport}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                        <Upload size={18} />
                        Excel-с оруулах
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                        <Plus size={18} />
                        {isLeaseTab ? 'Түрээс нэмэх' : 'Орон сууц нэмэх'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit border border-slate-200">
                <button
                    onClick={() => setActiveTab('apartments')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${activeTab === 'apartments'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <Home size={16} /> 🏠 Орон сууц
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'apartments' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {apartmentUnits.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('leased')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${activeTab === 'leased'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                >
                    <Key size={16} /> 📋 Түрээс
                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'leased' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {leasedUnits.length}
                    </span>
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-slate-500">Уншиж байна...</p>
            ) : displayData.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Building2 size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium text-slate-700">
                        {isLeaseTab ? 'Түрээс олдсонгүй' : 'Орон сууц олдсонгүй'}
                    </p>
                    <p className="text-sm mt-1">Дээрх товч дээр дарж шинэ бүртгэл нэмнэ үү</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-5 py-3.5">Барилга</th>
                                <th className="px-5 py-3.5">Орц</th>
                                <th className="px-5 py-3.5">Давхар</th>
                                <th className="px-5 py-3.5">Тасалгаа</th>
                                {isLeaseTab && <th className="px-5 py-3.5">Төрөл</th>}
                                <th className="px-5 py-3.5">
                                    {isLeaseTab ? 'Эзэмшигч' : 'Оршин суугч'}
                                </th>
                                {isLeaseTab && (
                                    <>
                                        <th className="px-5 py-3.5">Түрээслэгч</th>
                                        <th className="px-5 py-3.5">Түрээсийн хугацаа</th>
                                    </>
                                )}
                                <th className="px-5 py-3.5 text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.map((apt) => (
                                <tr
                                    key={apt.id}
                                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-slate-900 font-bold">{apt.buildingName}</td>
                                    <td className="px-5 py-3.5 text-slate-600 font-medium">{apt.entrance}</td>
                                    <td className="px-5 py-3.5 text-slate-600 font-medium">{apt.floor}</td>
                                    <td className="px-5 py-3.5 text-slate-600 font-medium">{apt.unitNumber}</td>
                                    {isLeaseTab && (
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${apt.unitType === 'MUSAR' ? 'bg-amber-100 text-amber-700' :
                                                    apt.unitType === 'LEASE' ? 'bg-blue-100 text-blue-700' :
                                                    apt.unitType === 'PARKING' ? 'bg-emerald-100 text-emerald-700' :
                                                    apt.unitType === 'STORAGE' ? 'bg-indigo-100 text-indigo-700' :
                                                        apt.unitType === 'BASEMENT' ? 'bg-slate-200 text-slate-800' :
                                                            'bg-purple-100 text-purple-700'
                                                }`}>
                                                {UNIT_TYPES.find(t => t.value === apt.unitType)?.label ?? apt.unitType}
                                            </span>
                                            {(apt as any).parentApartmentId && (
                                                <div className="text-[10px] text-slate-500 mt-1">
                                                    Холбоотой: {apartmentUnits.find(a => a.id === (apt as any).parentApartmentId)?.unitNumber || '...'}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                                        {isLeaseTab
                                            ? getUserName(apt.ownerId)
                                            : (apt.residents?.map(r => r.name).join(', ') || '—')
                                        }
                                    </td>
                                    {isLeaseTab && (
                                        <>
                                            <td className="px-5 py-3.5 text-slate-700 font-medium">
                                                {getUserName(apt.tenantId)}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-sm font-medium">
                                                {apt.leaseStartDate && apt.leaseEndDate
                                                    ? `${new Date(apt.leaseStartDate).toLocaleDateString('mn-MN')} — ${new Date(apt.leaseEndDate).toLocaleDateString('mn-MN')}`
                                                    : '—'
                                                }
                                            </td>
                                        </>
                                    )}
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => openEditModal(apt)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                                            title="Засах"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── Modal ────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Building2 size={22} className="text-blue-600" />
                            {editId ? 'Мэдээлэл засах' : (isLeaseTab ? 'Түрээс нэмэх' : 'Орон сууц нэмэх')}
                        </h2>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 mb-4">
                                {error}
                            </div>
                        )}

                        {/* Basic info */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Барилга *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.buildingName}
                                    onChange={e => setForm({ ...form, buildingName: e.target.value })}
                                    placeholder="Барилга А"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Орц *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.entrance}
                                    onChange={e => setForm({ ...form, entrance: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Давхар</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.floor || ''}
                                    onChange={e => setForm({ ...form, floor: parseInt(e.target.value) || 0 })}
                                    placeholder="2"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Тасалгаа *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.unitNumber}
                                    onChange={e => setForm({ ...form, unitNumber: e.target.value })}
                                    placeholder="101"
                                />
                            </div>
                        </div>

                        {/* Unit Type */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                <Home size={12} /> Төрөл
                            </label>
                            <select
                                className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                value={form.unitType}
                                onChange={e => setForm({ ...form, unitType: e.target.value })}
                            >
                                {UNIT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Parent Apartment Link (For Parking/Storage) */}
                        {(form.unitType === 'PARKING' || form.unitType === 'STORAGE') && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                    <Building2 size={12} /> Холбогдох Орон Сууц
                                </label>
                                <select
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.parentApartmentId}
                                    onChange={e => setForm({ ...form, parentApartmentId: e.target.value })}
                                >
                                    <option value="">— Холбохгүй —</option>
                                    {apartmentUnits.map(a => (
                                        <option key={a.id} value={a.id}>{a.buildingName} - {a.unitNumber}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Divider — Lease section */}
                        <div className="border-t border-slate-200 pt-4 mt-2 mb-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <UserIcon size={16} className="text-blue-600" />
                                Эзэмшигч & Түрээслэгч
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Эзэмшигч</label>
                                    <select
                                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                        value={form.ownerId}
                                        onChange={e => setForm({ ...form, ownerId: e.target.value })}
                                    >
                                        <option value="">— Сонгох —</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Түрээслэгч</label>
                                    <select
                                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                        value={form.tenantId}
                                        onChange={e => setForm({ ...form, tenantId: e.target.value })}
                                    >
                                        <option value="">— Сонгох —</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Lease dates */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Calendar size={16} className="text-emerald-500" />
                                Түрээсийн хугацаа
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Эхлэх огноо</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                        value={form.leaseStartDate}
                                        onChange={e => setForm({ ...form, leaseStartDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Дуусах огноо</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                        value={form.leaseEndDate}
                                        onChange={e => setForm({ ...form, leaseEndDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contract ID */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                <FileText size={14} /> Гэрээний дугаар
                            </label>
                            <input
                                className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                value={form.contractId}
                                onChange={e => setForm({ ...form, contractId: e.target.value })}
                                placeholder="GER-2025-001"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer"
                            >
                                Цуцлах
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                            >
                                {saving ? 'Хадгалж байна...' : (editId ? 'Хадгалах' : 'Нэмэх')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
