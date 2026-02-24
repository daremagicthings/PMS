import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Invoices from './pages/Invoices';
import Tickets from './pages/Tickets';
import Announcements from './pages/Announcements';
import Account from './pages/Account';
import WorkPlans from './pages/WorkPlans';
import Financials from './pages/Financials';
import Polls from './pages/Polls';

/**
 * Root application component with client-side routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/account" element={<Account />} />
          <Route path="/work-plans" element={<WorkPlans />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/polls" element={<Polls />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

