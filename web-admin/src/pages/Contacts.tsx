import { useState, useEffect } from 'react';
import { contactApi } from '../services/api';
import type { Contact } from '../services/api';
import { BookUser, Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function Contacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', phone: '', role: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchContacts = async () => {
        try {
            const { data } = await contactApi.getAll();
            if (data.success && data.data) {
                setContacts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch contacts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const openCreateModal = () => {
        setForm({ name: '', phone: '', role: '', description: '' });
        setEditId(null);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (c: Contact) => {
        setForm({ name: c.name, phone: c.phone, role: c.role, description: c.description || '' });
        setEditId(c.id);
        setError('');
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Энэ харилцагчийг устгах уу?')) return;
        try {
            await contactApi.delete(id);
            fetchContacts();
        } catch {
            alert('Устгахад алдаа гарлаа');
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.phone || !form.role) {
            setError('Нэр, утас, албан тушаал заавал оруулна.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (editId) {
                await contactApi.update(editId, form);
            } else {
                await contactApi.create(form);
            }
            setShowModal(false);
            fetchContacts();
        } catch {
            setError('Хадгалахад алдаа гарлаа.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookUser className="text-blue-600" size={28} />
                    <h1 className="text-2xl font-bold text-slate-900">Харилцах жагсаалт</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm"
                >
                    <Plus size={18} /> Харилцагч нэмэх
                </button>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full bg-white text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm shadow-sm"
                    placeholder="Нэр, утас, албан тушаалаар хайх..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p className="text-slate-500">Уншиж байна...</p>
            ) : filteredContacts.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <BookUser size={48} className="mx-auto mb-3 opacity-40 text-blue-600" />
                    <p className="text-lg font-medium text-slate-700">Одоогоор бүртгэлгүй байна.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContacts.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                                        <p className="text-sm font-semibold text-blue-600 mt-1">{c.role}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">📞</span>
                                        <span className="text-slate-700 font-mono text-sm">{c.phone}</span>
                                    </div>
                                    {c.description && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-slate-400 mt-0.5">ℹ️</span>
                                            <span className="text-slate-600 text-sm">{c.description}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => openEditModal(c)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <BookUser size={22} className="text-blue-600" />
                            {editId ? 'Харилцагч засах' : 'Харилцагч нэмэх'}
                        </h2>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Нэр *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Утасны дугаар *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Албан тушаал / Үүрэг *</label>
                                <input
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    placeholder="Жнь: Цахилгаанчин, Лифтчин"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Нэмэлт тайлбар</label>
                                <textarea
                                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm resize-none"
                                    rows={2}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
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
