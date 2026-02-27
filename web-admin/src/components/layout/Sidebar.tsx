import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Receipt,
    Ticket,
    Megaphone,
    ClipboardList,
    BarChart3,
    Vote,
    Car,
    FileText,
    BookUser,
    LogOut,
} from 'lucide-react';

/**
 * Navigation items for the sidebar.
 */
const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/residents', label: 'Residents', icon: Users },
    { to: '/invoices', label: 'Invoices', icon: Receipt },
    { to: '/reconciliation', label: 'Тулгалт', icon: FileText },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/work-plans', label: 'Work Plans', icon: ClipboardList },
    { to: '/financials', label: 'Financials', icon: BarChart3 },
    { to: '/polls', label: 'Polls', icon: Vote },
    { to: '/vehicles', label: 'Vehicles', icon: Car },
    { to: '/content', label: 'Мэдээлэл', icon: FileText },
    { to: '/contacts', label: 'Харилцах', icon: BookUser },
];

/**
 * Sidebar navigation component with dark theme.
 */
export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('soh_auth');
        window.location.href = '/'; // Force a full reload to clear state and potentially trigger auth wrapper if one exists, or just clear data
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <img src="/icon.png" alt="SOH Logo" className="w-10 h-10 rounded-xl object-cover shadow-md" />
                <div>
                    <h1 className="text-lg font-bold tracking-tight">СӨХ System</h1>
                    <p className="text-[11px] text-slate-400 -mt-0.5">Property Management</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-slate-700/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={18} />
                    <span>Гарах (Logout)</span>
                </button>
            </div>
        </aside>
    );
}
