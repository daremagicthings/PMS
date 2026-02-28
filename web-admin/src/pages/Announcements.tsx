import { useEffect, useState } from 'react';
import { ExternalLink, Plus, X, Pencil, Trash2, Save } from 'lucide-react';
import { announcementApi, userApi } from '../services/api';
import type { Announcement } from '../services/api';

/**
 * Announcements page — card-based list with create/edit/delete for announcements.
 */
export default function Announcements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);

    // Create form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editMeetingLink, setEditMeetingLink] = useState('');

    const fetchAnnouncements = async () => {
        try {
            const res = await announcementApi.getAll();
            setAnnouncements(res.data.data || []);
        } catch (err) {
            console.error('Announcements fetch error:', err);
            setError('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        userApi.getAll().then((res) => {
            const users = res.data.data || [];
            const admin = users.find((u) => u.role === 'ADMIN') || users[0];
            if (admin) setAdminId(admin.id);
        }).catch(console.error);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !adminId) return;
        setSaving(true);
        try {
            await announcementApi.create({
                title: title.trim(),
                content: content.trim(),
                meetingLink: meetingLink.trim() || undefined,
                createdById: adminId,
            });
            setTitle('');
            setContent('');
            setMeetingLink('');
            setShowForm(false);
            await fetchAnnouncements();
        } catch (err) {
            console.error('Failed to create announcement:', err);
            alert('Failed to create announcement.');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (a: Announcement) => {
        setEditingId(a.id);
        setEditTitle(a.title);
        setEditContent(a.content);
        setEditMeetingLink(a.meetingLink || '');
    };

    const handleUpdate = async () => {
        if (!editingId || !editTitle.trim() || !editContent.trim()) return;
        setSaving(true);
        try {
            await announcementApi.update(editingId, {
                title: editTitle.trim(),
                content: editContent.trim(),
                meetingLink: editMeetingLink.trim() || null,
            });
            setEditingId(null);
            await fetchAnnouncements();
        } catch (err) {
            console.error('Failed to update announcement:', err);
            alert('Failed to update announcement.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await announcementApi.delete(id);
            await fetchAnnouncements();
        } catch (err) {
            console.error('Failed to delete announcement:', err);
            alert('Failed to delete announcement.');
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
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Нийт {announcements.length} зарлал</p>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Цуцлах' : 'Шинэ зарлал'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
                >
                    <h3 className="text-base font-semibold text-slate-800">Зарлал үүсгэх</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Гарчиг</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Зарлалын гарчиг"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Агуулга</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                            placeholder="Зарлалаа энд бичнэ үү..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Уулзалтын холбоос (заавал биш)</label>
                        <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="https://zoom.us/j/..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || !title.trim() || !content.trim()}
                            className="px-6 py-2.5 bg-blue-500 text-white font-medium text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Нийтэлж байна...' : '📢 Зарлал нийтлэх'}
                        </button>
                    </div>
                </form>
            )}

            {/* Announcements list */}
            {announcements.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                    Зарлал алга — "Шинэ зарлал" товчийг дарж үүсгэнэ үү
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {announcements.map((a) => (
                        <div key={a.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            {editingId === a.id ? (
                                /* ─── EDIT MODE ─── */
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 resize-none"
                                    />
                                    <input
                                        type="url"
                                        value={editMeetingLink}
                                        onChange={(e) => setEditMeetingLink(e.target.value)}
                                        placeholder="Уулзалтын холбоос (заавал биш)"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            Цуцлах
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                        >
                                            <Save size={12} /> {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ─── VIEW MODE ─── */
                                <>
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base font-semibold text-slate-800">{a.title}</h3>
                                        <div className="flex items-center gap-1 ml-4">
                                            <button
                                                onClick={() => startEdit(a)}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
                                                title="Засах"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Устгах"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(a.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{a.content}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-400">{a.createdBy?.name || 'Админ'} нийтэлсэн</p>
                                        {a.meetingLink && (
                                            <a
                                                href={a.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                            >
                                                <ExternalLink size={12} /> Уулзалтад нэгдэх
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
