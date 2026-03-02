import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if already logged in
    const existingAuth = localStorage.getItem('soh_auth');
    if (existingAuth) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authApi.login(phone, password);
            if (res.data.success && res.data.data) {
                // Must be an admin to use the web admin portal
                if (res.data.data.user.role !== 'ADMIN' && res.data.data.user.role !== 'SUPER_ADMIN') {
                    setError('Зөвхөн СӨХ-н админ нэвтрэх эрхтэй.');
                    return;
                }

                localStorage.setItem('soh_auth', JSON.stringify({
                    token: res.data.data.token,
                    user: res.data.data.user
                }));

                // Force a hard reload so all components pick up the new token
                window.location.href = '/';
            } else {
                setError('Нэвтрэх мэдээлэл буруу байна.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                        <span className="text-2xl font-bold text-slate-900">СӨХ</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Удирдлагын самбар</h1>
                    <p className="text-slate-400 mt-2 text-sm">СӨХ-н системд тавтай морил</p>
                </div>

                <div className="p-8">
                    {error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Утасны дугаар</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="Утасны дугаар"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нууц үг</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                placeholder="Нууц үг"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors disabled:opacity-70 mt-4"
                        >
                            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}