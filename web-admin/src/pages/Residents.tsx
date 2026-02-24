import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { apartmentApi, userApi } from '../services/api';
import type { Apartment, User } from '../services/api';

/**
 * Residents & Apartments page.
 * Shows apartments table with linked residents and an "Add Apartment" modal.
 */
export default function Residents() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ buildingName: '', entrance: '', floor: '', unitNumber: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [aptRes, userRes] = await Promise.all([
                apartmentApi.getAll(),
                userApi.getAll(),
            ]);
            setApartments(aptRes.data.data || []);
            setUsers(userRes.data.data || []);
        } catch (err) {
            console.error('Residents fetch error:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apartmentApi.create({
                buildingName: formData.buildingName,
                entrance: formData.entrance,
                floor: parseInt(formData.floor, 10),
                unitNumber: formData.unitNumber,
            });
            setShowModal(false);
            setFormData({ buildingName: '', entrance: '', floor: '', unitNumber: '' });
            await fetchData();
        } catch (err) {
            console.error('Create apartment error:', err);
            alert('Failed to create apartment. Please try again.');
        } finally {
            setSubmitting(false);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{apartments.length} apartments · {users.length} users</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Add Apartment
                </button>
            </div>

            {/* Apartments Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Building</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Entrance</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Floor</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Unit</th>
                            <th className="text-left px-6 py-3 font-semibold text-slate-600">Residents</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {apartments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{apt.buildingName}</td>
                                <td className="px-6 py-4 text-slate-600">{apt.entrance}</td>
                                <td className="px-6 py-4 text-slate-600">{apt.floor}</td>
                                <td className="px-6 py-4 text-slate-600">{apt.unitNumber}</td>
                                <td className="px-6 py-4">
                                    {apt.residents && apt.residents.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {apt.residents.map((r) => (
                                                <span key={r.id} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                                    {r.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs">No residents</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {apartments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No apartments found. Add one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Apartment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800">Add Apartment</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Building Name</label>
                                <input
                                    type="text" required value={formData.buildingName}
                                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Building A"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Entrance</label>
                                    <input
                                        type="text" required value={formData.entrance}
                                        onChange={(e) => setFormData({ ...formData, entrance: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                                    <input
                                        type="number" required value={formData.floor}
                                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit №</label>
                                    <input
                                        type="text" required value={formData.unitNumber}
                                        onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="301"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit" disabled={submitting}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create Apartment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
