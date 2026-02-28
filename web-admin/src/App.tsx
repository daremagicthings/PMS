import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Vehicles from './pages/Vehicles';
import ContentSetup from './pages/ContentSetup';
import Contacts from './pages/Contacts';
import Reconciliation from './pages/Reconciliation';
import Login from './pages/Login';

/**
 * Simple auth wrapper to protect admin routes
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem('soh_auth');
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Root application component with client-side routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/account" element={<Account />} />
          <Route path="/work-plans" element={<WorkPlans />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/content" element={<ContentSetup />} />
          <Route path="/contacts" element={<Contacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
