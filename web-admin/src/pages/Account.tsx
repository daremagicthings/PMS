import { useEffect, useState } from 'react';
import { userApi, authApi } from '../services/api';
import type { User } from '../services/api';

/**
 * Account settings page — admin profile and password change.
 * Password change authenticates via login first, then calls PUT /auth/password.
 */
export default function Account() {
    const [admin, setAdmin] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        userApi.getAll().then((res) => {
            const users = res.data.data || [];
            const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
            if (adminUser) setAdmin(adminUser);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    /**
     * Handles password change via the real backend API.
     * 1. Logs in with the current password to get a JWT token.
     * 2. Stores the token in localStorage for the interceptor.
     * 3. Calls PUT /auth/password with old and new passwords.
     */
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', message: 'New passwords do not match!' });
            return;
        }
        if (newPassword.length < 6) {
            setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }

        setSaving(true);
        try {
            // Step 1: Login to get a fresh JWT token
            const loginRes = await authApi.login(admin?.phone || '', currentPassword);
            if (loginRes.data.success && loginRes.data.data) {
                // Store token for the interceptor to pick up
                localStorage.setItem('soh_auth', JSON.stringify({
                    token: loginRes.data.data.token,
                    user: loginRes.data.data.user,
                }));
            }

            // Step 2: Call the password change endpoint
            const res = await authApi.changePassword(currentPassword, newPassword);
            if (res.data.success) {
                setFeedback({ type: 'success', message: 'Password updated successfully! ✅' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setFeedback({ type: 'error', message: res.data.message || 'Failed to change password.' });
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || 'Failed to change password. Please check your current password.';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24"></div>
                <div className="px-6 pb-6 -mt-10">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                                {admin?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-xl font-bold text-slate-800">{admin?.name || 'Admin'}</h2>
                        <p className="text-sm text-slate-500 mt-1">{admin?.role || 'ADMIN'}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-400 font-medium">Phone</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{admin?.phone || '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-400 font-medium">Email</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{admin?.email || 'Not set'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-400 font-medium">Role</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {admin?.role}
                                </span>
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-400 font-medium">User ID</p>
                            <p className="text-xs font-mono text-slate-500 mt-1 truncate">{admin?.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-4">🔒 Change Password</h3>

                {/* Feedback message */}
                {feedback && (
                    <div
                        className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${feedback.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Repeat new password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-500 text-white font-medium text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
