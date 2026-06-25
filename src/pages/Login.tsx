import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address.');
    setIsLoading(true);
    const { error: loginError } = await login(form.email, form.password);
    setIsLoading(false);
    if (!loginError) {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user;
      let dest = '/dashboard';
      if (u) {
        const { data: adminRow } = await supabase.from('admin_users').select('role').eq('user_id', u.id).eq('is_active', true).single();
        if (adminRow && ['admin', 'super_admin'].includes(adminRow.role)) dest = '/admin';
      }
      navigate(dest);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}>
      
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <Zap size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            <span className="text-blue-200">Prime</span>Connect
          </h1>
          <p className="text-blue-200 text-sm mt-1">Nigeria's #1 Digital Services Platform</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to continue</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 font-semibold">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all mt-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-blue-200 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-bold">Create one free</Link>
        </p>
      </div>

      {/* Bottom trust badges */}
      <div className="flex justify-center gap-6 pb-8 px-6">
        <div className="flex items-center gap-1.5 text-blue-200 text-xs">
          <span>🔒</span> 100% Secure
        </div>
        <div className="flex items-center gap-1.5 text-blue-200 text-xs">
          <span>⚡</span> Instant Delivery
        </div>
        <div className="flex items-center gap-1.5 text-blue-200 text-xs">
          <span>🇳🇬</span> Made in Nigeria
        </div>
      </div>
    </div>
  );
};

export default Login;
