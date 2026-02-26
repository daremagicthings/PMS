import { useState, useEffect } from 'react';
import { pollApi } from '../services/api';
import type { Poll } from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/** Vibrant colour palette for bar chart segments */
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

/**
 * Admin Polls page — create, monitor, and close digital votes.
 * Light theme with voter details matching the main Dashboard.
 */
export default function Polls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Create form state ───────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [submitting, setSubmitting] = useState(false);

    // ── Expanded voters state ───────────────────────────
    const [expandedPoll, setExpandedPoll] = useState<string | null>(null);

    const fetchPolls = async () => {
        try {
            const { data: res } = await pollApi.getAll();
            if (res.success && res.data) setPolls(res.data);
        } catch {
            console.error('Failed to fetch polls');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPolls(); }, []);

    // ── Create poll ─────────────────────────────────────
    const handleCreate = async () => {
        const validOptions = options.filter((o) => o.trim());
        if (!title.trim() || validOptions.length < 2) {
            alert('Title and at least 2 options are required');
            return;
        }
        setSubmitting(true);
        try {
            await pollApi.create({
                title: title.trim(),
                description: description.trim() || undefined,
                endDate: endDate || undefined,
                options: validOptions,
            });
            setTitle(''); setDescription(''); setEndDate(''); setOptions(['', '']);
            setShowForm(false);
            fetchPolls();
        } catch {
            alert('Failed to create poll');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Close poll ──────────────────────────────────────
    const handleClose = async (pollId: string) => {
        if (!confirm('Are you sure you want to close this poll? This cannot be undone.')) return;
        try {
            await pollApi.close(pollId);
            fetchPolls();
        } catch {
            alert('Failed to close poll');
        }
    };

    // ── Add / remove option fields ──────────────────────
    const addOption = () => setOptions([...options, '']);
    const removeOption = (i: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, idx) => idx !== i));
    };
    const updateOption = (i: number, val: string) => {
        const copy = [...options];
        copy[i] = val;
        setOptions(copy);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">📊 Санал асуулга</h1>
                    <p className="text-slate-500 text-sm mt-1">Оршин суугчдын санал асуулга үүсгэх, удирдах</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25"
                >
                    {showForm ? '✕ Cancel' : '+ New Poll'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7 space-y-5 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm">✏️</span>
                        Шинэ санал асуулга
                    </h2>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Гарчиг *</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Жнь: Орцны хаалга солих уу?"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Тайлбар</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Нэмэлт тайлбар..."
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Дуусах огноо (заавал биш)</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Сонголтууд * (хамгийн багадаа 2)</label>
                        <div className="space-y-2">
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-linear-to-br from-indigo-500 to-purple-500 shrink-0">
                                        {i + 1}
                                    </div>
                                    <input
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        placeholder={`Сонголт ${i + 1}`}
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                    {options.length > 2 && (
                                        <button
                                            onClick={() => removeOption(i)}
                                            className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addOption}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium flex items-center gap-1"
                        >
                            + Сонголт нэмэх
                        </button>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={submitting}
                        className="px-6 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
                    >
                        {submitting ? 'Үүсгэж байна...' : '✓ Санал асуулга үүсгэх'}
                    </button>
                </div>
            )}

            {/* Polls List */}
            {polls.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-6xl mb-4">📊</p>
                    <p className="text-xl font-semibold text-slate-900 mb-1">Санал асуулга байхгүй байна</p>
                    <p className="text-sm">Эхний санал асуулгаа үүсгээрэй.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {polls.map((poll) => {
                        const totalVotes = poll._count.votes;
                        const chartData = poll.options.map((opt) => ({
                            name: opt.text.length > 25 ? opt.text.slice(0, 25) + '…' : opt.text,
                            fullName: opt.text,
                            votes: opt._count.votes,
                            pct: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
                        }));
                        const isExpanded = expandedPoll === poll.id;

                        return (
                            <div
                                key={poll.id}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                            >
                                {/* Poll Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-900">{poll.title}</h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${poll.status === 'ACTIVE'
                                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                        }`}
                                                >
                                                    {poll.status === 'ACTIVE' ? 'Идэвхтэй' : 'Хаагдсан'}
                                                </span>
                                            </div>
                                            {poll.description && (
                                                <p className="text-sm text-slate-600 leading-relaxed">{poll.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <span className="text-base">🗳️</span>
                                                    <span className="font-bold text-slate-700">{totalVotes}</span> санал
                                                </span>
                                                {poll.endDate && (
                                                    <span>Дуусах: {new Date(poll.endDate).toLocaleDateString()}</span>
                                                )}
                                                <span>Үүсгэсэн: {new Date(poll.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {poll.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleClose(poll.id)}
                                                className="ml-4 px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-semibold border border-red-200 shadow-sm"
                                            >
                                                Асуулга хаах
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Chart + Results */}
                                <div className="px-6 pb-2">
                                    {totalVotes > 0 ? (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <div className="h-[140px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                                                            width={130}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: '#ffffff',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '12px',
                                                                color: '#0f172a',
                                                                fontSize: '13px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                            }}
                                                            formatter={(value, _name, props) => [
                                                                `${value} санал (${(props.payload as Record<string, number>).pct}%)`,
                                                                'Санал',
                                                            ]}
                                                        />
                                                        <Bar dataKey="votes" radius={[0, 8, 8, 0]} barSize={22}>
                                                            {chartData.map((_entry, idx) => (
                                                                <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                            🗳️ Одоогоор санал өгсөн хүн алга байна.
                                        </div>
                                    )}
                                </div>

                                {/* Options breakdown + voter names */}
                                <div className="px-6 py-4 space-y-2">
                                    {poll.options.map((opt, idx) => {
                                        const pct = totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0;
                                        const color = BAR_COLORS[idx % BAR_COLORS.length];
                                        // Extract voter names from the option data
                                        const voters = opt.votes?.map((v) => v.user?.name).filter(Boolean) || [];

                                        return (
                                            <div key={opt.id} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-sm text-slate-700 flex-1 font-semibold">{opt.text}</span>
                                                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                        {opt._count.votes}
                                                    </span>
                                                    <span className="text-xs text-slate-500 w-12 text-right">
                                                        ({pct}%)
                                                    </span>
                                                </div>

                                                {/* Voter names */}
                                                {voters.length > 0 && (
                                                    <div className="mt-2 ml-6 flex flex-wrap gap-1.5">
                                                        {voters.map((name: string, vi: number) => (
                                                            <span
                                                                key={vi}
                                                                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                                                                style={{
                                                                    backgroundColor: color + '15',
                                                                    color: color,
                                                                    border: `1px solid ${color}30`,
                                                                }}
                                                            >
                                                                👤 {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Toggle voter details */}
                                {totalVotes > 0 && (
                                    <div className="px-6 pb-5">
                                        <button
                                            onClick={() => setExpandedPoll(isExpanded ? null : poll.id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
                                        >
                                            {isExpanded ? '▲ Дэлгэрэнгүй хаах' : `▼ Бүх ${totalVotes} санал өгөгчийг харах`}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                                <table className="w-full text-sm text-left">
                                                    <thead>
                                                        <tr className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                                            <th className="py-2 px-2">Оршин суугч</th>
                                                            <th className="py-2 px-2">Сонголт</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {poll.options.flatMap((opt, optIdx) =>
                                                            (opt.votes || []).map((v, vi) => (
                                                                <tr key={`${opt.id}-${vi}`} className="hover:bg-slate-50">
                                                                    <td className="py-2 px-2 text-slate-800 font-medium">
                                                                        <span className="flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                                                                                {(v.user?.name || '?')[0]}
                                                                            </span>
                                                                            {v.user?.name || 'Unknown'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-2">
                                                                        <span
                                                                            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                                            style={{
                                                                                backgroundColor: BAR_COLORS[optIdx % BAR_COLORS.length] + '20',
                                                                                color: BAR_COLORS[optIdx % BAR_COLORS.length],
                                                                            }}
                                                                        >
                                                                            {opt.text}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
