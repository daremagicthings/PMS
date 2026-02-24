import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Main application layout wrapping all pages.
 * Sidebar is fixed on the left, Header at top, content scrolls below.
 */
export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
