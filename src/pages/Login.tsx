import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col" style={{background:'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 45%, #3b82f6 100%)'}}>
      
      {/* Top section - compact */}
      <div className="flex flex-col items-center pt-10 pb-4 px-6">
        {/* Logo - smaller */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-xl"
          style={{background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,0.2)'}}>
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight" style={{color:'#fff'}}>
          <span style={{color:'#93c5fd'}}>Prime</span>Connect
        </h1>
        <p className="text-blue-200 text-xs mt-1">Nigeria's #1 Digital Services Platform</p>
      </div>

      {/* Card - moved up */}
      <div className="flex-1 flex flex-col px-5">
        <div className="bg-white rounded-3xl p-6 shadow-2xl" style={{boxShadow:'0 25px 60px rgba(0,0,0,0.25)'}}>
          
          <h2 className="text-xl font-black text-gray-900 mb-0.5">Welcome back 👋</h2>
          <p className="text-gray-400 text-sm mb-5">Sign in to continue</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
              <span className="text-red-400">⚠</span> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail size={16} className="text-blue-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                  style={{background:'#f8faff', border:'2px solid #e8f0fe', fontSize:'14px'}}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e8f0fe'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 font-bold">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock size={16} className="text-blue-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-4 rounded-2xl text-sm transition-all focus:outline-none"
                  style={{background:'#f8faff', border:'2px solid #e8f0fe', fontSize:'14px'}}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e8f0fe'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white font-black py-4 rounded-2xl transition-all disabled:opacity-70 mt-2"
              style={{background:'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow:'0 8px 24px rgba(37,99,235,0.4)', fontSize:'15px'}}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Create account */}
        <p className="text-center text-sm text-blue-200 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-black underline underline-offset-2">Create one free</Link>
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-5 mt-5 pb-8">
          <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>🔒</span> 100% Secure</div>
          <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>⚡</span> Instant</div>
          <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>🇳🇬</span> Made in Nigeria</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
