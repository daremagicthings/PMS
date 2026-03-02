import { useLocation, Link } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';

/**
 * Map route paths to human-readable page titles.
 */
const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/residents': 'Residents & Apartments',
    '/invoices': 'Invoices & Finances',
    '/tickets': 'Tickets & Requests',
    '/announcements': 'Announcements',
    '/account': 'Account',
};

/**
 * Top header component showing current page title, notification bell, and admin avatar.
 */
export default function Header() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>

            <div className="flex items-center gap-4">
                <NotificationDropdown />
                <Link to="/account" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Admin</span>
                </Link>
            </div>
        </header>
    );
}

