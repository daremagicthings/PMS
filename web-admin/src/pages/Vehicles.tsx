import { useEffect, useState } from 'react';
import { Car, Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Vehicle, Apartment, ApiResponse } from '../services/api';
import { vehicleApi, apartmentApi } from '../services/api';

const emptyForm = { licensePlate: '', makeModel: '', apartmentId: '' };

export default function Vehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vRes, aRes] = await Promise.all([
                vehicleApi.getAll(search || undefined),
                apartmentApi.getAll(),
            ]);
            setVehicles(vRes.data.data ?? []);
            setApartments(aRes.data.data ?? []);
        } catch {
            console.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [search]);

    const openCreateModal = () => {
        setEditId(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (v: Vehicle) => {
        setEditId(v.id);
        setForm({
            licensePlate: v.licensePlate,
            makeModel: v.makeModel,
            apartmentId: v.apartmentId,
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.licensePlate || !form.makeModel || !form.apartmentId) {
            setError('Бүх талбарыг бөглөнө үү');
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (editId) {
                await vehicleApi.update(editId, form);
            } else {
                await vehicleApi.create(form);
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

    const handleDelete = async (id: string) => {
        if (!window.confirm('Энэ машиныг устгах уу?')) return;
        try {
            await vehicleApi.delete(id);
            fetchData();
        } catch {
            alert('Устгахад алдаа гарлаа');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Car className="text-blue-600" size={28} />
                    <h1 className="text-2xl font-bold text-slate-900">Автомашин</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm"
                >
                    <Plus size={18} /> Машин нэмэх
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full bg-white text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm shadow-sm"
                    placeholder="Улсын дугаараар хайх..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-slate-500">Уншиж байна...</p>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Car size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium text-slate-700">
                        {search ? 'Хайлтад тохирох машин олдсонгүй' : 'Бүртгэлтэй машин байхгүй'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-5 py-3.5">Улсын дугаар</th>
                                <th className="px-5 py-3.5">Марк / Загвар</th>
                                <th className="px-5 py-3.5">Орон сууц</th>
                                <th className="px-5 py-3.5">Бүртгэсэн</th>
                                <th className="px-5 py-3.5 text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v) => (
                                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold px-3 py-1 rounded-lg text-sm">
                                            {v.licensePlate}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-900 font-medium">{v.makeModel}</td>
                                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                                        {v.apartment
                                            ? `${v.apartment.buildingName} / ${v.apartment.entrance} / ${v.apartment.unitNumber}`
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-sm font-medium">
                                        {new Date(v.createdAt).toLocaleDateString('mn-MN')}
                                    </td>
                                    <td className="px-5 py-3.5 text-right flex gap-2 justify-end">
                                        <button
                                            onClick={() => openEditModal(v)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer"
                                            title="Засах"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer"
                                            title="Устгах"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Car size={22} className="text-blue-600" />
                            {editId ? 'Машин засах' : 'Машин нэмэх'}
                        </h2>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Улсын дугаар *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-mono uppercase"
                                    value={form.licensePlate}
                                    onChange={e => setForm({ ...form, licensePlate: e.target.value })}
                                    placeholder="1234 УБА"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Марк / Загвар *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.makeModel}
                                    onChange={e => setForm({ ...form, makeModel: e.target.value })}
                                    placeholder="Toyota Prius 2020"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Орон сууц *</label>
                                <select
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.apartmentId}
                                    onChange={e => setForm({ ...form, apartmentId: e.target.value })}
                                >
                                    <option value="">— Сонгох —</option>
                                    {apartments.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.buildingName} / {a.entrance}орц / {a.unitNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold cursor-pointer"
                            >
                                Цуцлах
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm"
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
