import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [form, setForm] = useState({ email: '', password: '' });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passwordValid = form.password.length >= 1;
  const hasEmailError = touched.email && !emailValid;
  const hasPasswordError = touched.password && !passwordValid;

  const getEmailError = () => {
    if (!touched.email) return '';
    if (!form.email) return 'Email address is required';
    if (!emailValid) return 'Please enter a valid email address';
    return '';
  };

  const getPasswordError = () => {
    if (!touched.password) return '';
    if (!form.password) return 'Password is required';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }));
    setFocusedField(null);
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    if (!emailValid) return setError('Enter a valid email address.');
    setIsLoading(true);
    setError('');
    const { error: loginError } = await login(form.email, form.password);
    setIsLoading(false);
    if (!loginError) {
      setSuccess(true);
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user;
      let dest = '/dashboard';
      if (u) {
        const { data: adminRow } = await supabase.from('admin_users').select('role').eq('user_id', u.id).eq('is_active', true).single();
        if (adminRow && ['admin', 'super_admin'].includes(adminRow.role)) dest = '/admin';
      }
      setTimeout(() => navigate(dest), 700);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const inputStyle = (field: string, hasError: boolean) => ({
    background: hasError ? '#fff5f5' : '#ffffff',
    border: `1.5px solid ${hasError ? '#fca5a5' : focusedField === field ? '#2563eb' : '#e2e8f0'}`,
    borderRadius: '14px',
    height: '56px',
    width: '100%',
    paddingLeft: '48px',
    paddingRight: field === 'password' ? '52px' : '16px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field
      ? '0 0 0 3px rgba(37,99,235,0.1), 0 1px 3px rgba(0,0,0,0.05)'
      : '0 1px 2px rgba(0,0,0,0.04)',
  });

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto relative"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2460 25%, #1a3a8f 55%, #2563eb 85%, #3b82f6 100%)' }}>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-32 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', transform: 'translate(-30%, 0)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Logo */}
      <div className="flex flex-col items-center pt-10 pb-4 px-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          <Zap size={22} className="text-white" />
        </div>
        <h1 className="font-black tracking-tight" style={{ fontSize: '20px', color: '#fff', letterSpacing: '-0.3px' }}>
          <span style={{ color: '#93c5fd' }}>Prime</span>Connect
        </h1>
        <p className="text-blue-200 mt-1" style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.02em' }}>
          Nigeria's #1 Digital Services Platform
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col px-4 relative z-10 pb-8">
        <div className="bg-white rounded-3xl p-6"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="font-black text-gray-900" style={{ fontSize: '22px', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
              Welcome back 👋
            </h2>
            <p className="text-gray-500 mt-1.5" style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>
              Sign in to your PrimeConnect account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl flex items-start gap-2.5"
              style={{ background: '#fff1f2', border: '1.5px solid #fecdd3' }}>
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-600 font-medium" style={{ fontSize: '13px' }}>{error}</p>
            </div>
          )}

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block font-bold text-gray-500 mb-2 uppercase tracking-widest"
                style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Mail size={16} style={{ color: focusedField === 'email' ? '#2563eb' : hasEmailError ? '#f87171' : '#94a3b8' }} />
                </div>
                <input
                  name="email" type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => handleBlur('email')}
                  style={inputStyle('email', !!getEmailError())}
                />
                {form.email && emailValid && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={15} className="text-green-500" />
                  </div>
                )}
              </div>
              {getEmailError() && (
                <p className="mt-1.5 text-red-500 font-medium" style={{ fontSize: '12px' }}>{getEmailError()}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-gray-500 uppercase tracking-widest"
                  style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  Password
                </label>
                <Link to="/forgot-password" className="font-bold text-blue-600" style={{ fontSize: '12px' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock size={16} style={{ color: focusedField === 'password' ? '#2563eb' : hasPasswordError ? '#f87171' : '#94a3b8' }} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => handleBlur('password')}
                  style={inputStyle('password', !!getPasswordError())}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-xl"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} className="text-gray-400" /> : <Eye size={17} className="text-gray-400" />}
                </button>
              </div>
              {getPasswordError() && (
                <p className="mt-1.5 text-red-500 font-medium" style={{ fontSize: '12px' }}>{getPasswordError()}</p>
              )}
            </div>

            {/* Remember Me + SSL */}
            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5"
                style={{ minHeight: '44px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                  background: rememberMe ? '#2563eb' : '#fff',
                  border: `2px solid ${rememberMe ? '#2563eb' : '#cbd5e1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {rememberMe && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}>✓</span>}
                </div>
                <span className="text-gray-600 font-medium" style={{ fontSize: '13px' }}>Remember me</span>
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '10px' }}>🔒</span>
                <span className="text-green-700 font-bold" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>SSL SECURED</span>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
              disabled={isLoading || success}
              className="w-full text-white font-black relative overflow-hidden select-none"
              style={{
                background: success
                  ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                  : pressed
                    ? 'linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)'
                    : 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                borderRadius: '14px',
                height: '56px',
                fontSize: '16px',
                letterSpacing: '0.01em',
                boxShadow: success
                  ? '0 4px 16px rgba(34,197,94,0.4)'
                  : pressed
                    ? '0 2px 6px rgba(37,99,235,0.3)'
                    : '0 4px 16px rgba(37,99,235,0.4)',
                transform: pressed ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isLoading ? 0.9 : 1,
                cursor: isLoading || success ? 'not-allowed' : 'pointer',
              }}>
              {pressed && !success && (
                <span className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
              )}
              {success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} className="text-white" />
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>Success!</span>
                </span>
              ) : isLoading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>Sign In</span>
                  <span style={{ fontSize: '18px' }}>→</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Create account */}
        <p className="text-center text-blue-200 mt-5" style={{ fontSize: '13px' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-black"
            style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Create one free
          </Link>
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-3 mt-4 pb-8">
          {[
            { icon: '🔒', text: '100% Secure', sub: 'Bank-grade' },
            { icon: '⚡', text: 'Instant', sub: 'Real-time' },
            { icon: '🇳🇬', text: 'Nigerian', sub: 'Proudly local' },
          ].map((b, i) => (
            <div key={b.text}
              className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                animation: `fadeSlideUp 0.4s ease ${0.1 + i * 0.1}s both`,
                minWidth: '80px',
              }}>
              <span style={{ fontSize: '16px' }}>{b.icon}</span>
              <span className="text-white font-bold" style={{ fontSize: '11px' }}>{b.text}</span>
              <span className="text-blue-300" style={{ fontSize: '9px', fontWeight: '500' }}>{b.sub}</span>
            </div>
          ))}
        </div>
        <style>{"@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }"}</style>
      </div>
    </div>
  );
};

export default Login;
