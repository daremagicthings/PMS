import { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, Ticket, Users } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { invoiceApi, ticketApi, apartmentApi } from '../services/api';
import type { Invoice, Ticket as TicketType, Apartment } from '../services/api';

// ─── Stat Card ──────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={22} className="text-white" />
                </div>
            </div>
        </div>
    );
}

// ─── Helpers ────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Aggregate paid invoices by month (last 6 months) */
function getMonthlyRevenue(invoices: Invoice[]): { month: string; collected: number; unpaid: number }[] {
    const now = new Date();
    const data: { month: string; collected: number; unpaid: number }[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        const key = `${month} ${year}`;

        const monthInvoices = invoices.filter((inv) => {
            const invDate = new Date(inv.createdAt || inv.dueDate);
            return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
        });

        data.push({
            month: key,
            collected: monthInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
            unpaid: monthInvoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0),
        });
    }

    return data;
}

/** Get ticket status breakdown for pie chart */
function getTicketStatusBreakdown(tickets: TicketType[]): { name: string; value: number; color: string }[] {
    const newCount = tickets.filter(t => t.status === 'NEW').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;

    return [
        { name: 'New', value: newCount, color: '#3b82f6' },
        { name: 'In Progress', value: inProgress, color: '#f59e0b' },
        { name: 'Resolved', value: resolved, color: '#22c55e' },
    ].filter(d => d.value > 0);
}

// ─── Dashboard ──────────────────────────────────────────

/**
 * Dashboard page — overview stats + recharts analytics.
 */
export default function Dashboard() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invRes, tickRes, aptRes] = await Promise.all([
                    invoiceApi.getAll(),
                    ticketApi.getAll(),
                    apartmentApi.getAll(),
                ]);
                setInvoices(invRes.data.data || []);
                setTickets(tickRes.data.data || []);
                setApartments(aptRes.data.data || []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <p className="font-medium">⚠️ {error}</p>
            </div>
        );
    }

    const totalCollected = invoices
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);

    const totalUnpaid = invoices
        .filter((i) => i.status === 'PENDING')
        .reduce((sum, i) => sum + i.amount, 0);

    const activeTickets = tickets.filter((t) => t.status !== 'RESOLVED').length;

    const monthlyData = getMonthlyRevenue(invoices);
    const ticketStatusData = getTicketStatusBreakdown(tickets);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Нийт цуглуулсан"
                    value={`₮${totalCollected.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    subtitle={`${invoices.filter(i => i.status === 'PAID').length} төлөгдсөн нэхэмжлэл`}
                />
                <StatCard
                    title="Төлөгдөөгүй дүн"
                    value={`₮${totalUnpaid.toLocaleString()}`}
                    icon={AlertTriangle}
                    color="bg-gradient-to-br from-amber-500 to-orange-500"
                    subtitle={`${invoices.filter(i => i.status === 'PENDING').length} хүлээгдэж буй нэхэмжлэл`}
                />
                <StatCard
                    title="Идэвхтэй санал гомдол"
                    value={activeTickets}
                    icon={Ticket}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    subtitle={`Нийт ${tickets.length} санал гомдол`}
                />
                <StatCard
                    title="Нийт айл өрх"
                    value={apartments.length}
                    icon={Users}
                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                    subtitle="Бүртгэлтэй нэгжүүд"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Bar Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Сарын орлого</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#e2e8f0' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#e2e8f0' }}
                                tickLine={false}
                                tickFormatter={(v: number) => `₮${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: 13,
                                }}
                                formatter={(value: number | undefined) => [`₮${(value ?? 0).toLocaleString()}`, '']}
                            />
                            <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="unpaid" name="Unpaid" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Ticket Status Pie Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Санал гомдлын төлөв</h3>
                    {ticketStatusData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px]">
                            <p className="text-sm text-slate-400">Санал гомдол алга</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={ticketStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, percent }: { name?: string; percent?: number }) =>
                                        `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {ticketStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        fontSize: 13,
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
