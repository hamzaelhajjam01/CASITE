import { useState } from 'react';
import { useNavigate } from 'react-router';
import { login } from '../../api/admin';

export default function AdminLogin() {
  const [email, setEmail]       = useState('admin@polarguard.ca');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await login(email, password);
      localStorage.setItem('pg_admin_token', token);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#081826] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#168A5A] mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="font-satoshi font-semibold text-white text-[24px]">PolarGuard Admin</h1>
          <p className="font-inter text-white/40 text-[14px] mt-1">Sign in to manage packages</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[16px] p-8 space-y-5">
          <div>
            <label className="block font-inter text-[13px] font-medium text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[10px] font-inter text-[14px] text-white placeholder-white/30 outline-none focus:border-[#168A5A] focus:ring-1 focus:ring-[#168A5A] transition-all"
            />
          </div>

          <div>
            <label className="block font-inter text-[13px] font-medium text-white/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-[10px] font-inter text-[14px] text-white placeholder-white/30 outline-none focus:border-[#168A5A] focus:ring-1 focus:ring-[#168A5A] transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[8px] px-4 py-3">
              <p className="font-inter text-[13px] text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#168A5A] hover:bg-[#1a9e67] disabled:opacity-50 text-white font-inter text-[15px] font-semibold py-3 rounded-[10px] transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center font-inter text-white/20 text-[12px] mt-6">
          PolarGuard Insurance — Admin Portal
        </p>
      </div>
    </div>
  );
}
