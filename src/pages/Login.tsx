import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pressed, setPressed] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
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

  const inputStyle = (field: string, hasError: boolean) => ({
    background: hasError ? '#fff5f5' : '#ffffff',
    border: `1px solid ${hasError ? '#fca5a5' : focusedField === field ? '#2563eb' : '#e2e8f0'}`,
    borderRadius: '16px',
    height: '56px',
    width: '100%',
    paddingLeft: '48px',
    paddingRight: field === 'password' ? '48px' : '16px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field
      ? '0 0 0 3px rgba(37,99,235,0.12), 0 1px 3px rgba(0,0,0,0.06)'
      : '0 1px 3px rgba(0,0,0,0.06)',
  });

  const hasEmailError = error && !form.email;
  const hasPasswordError = error && !form.password;

  return (
    <div className="min-h-screen flex flex-col" 
      style={{background:'linear-gradient(160deg, #0f2460 0%, #1a3a8f 30%, #1d4ed8 65%, #3b82f6 100%)'}}>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" 
        style={{background:'white', transform:'translate(30%, -30%)'}} />
      <div className="absolute top-20 left-0 w-32 h-32 rounded-full opacity-5"
        style={{background:'white', transform:'translate(-40%, 0)'}} />

      {/* Logo Section - compact */}
      <div className="flex flex-col items-center pt-8 pb-3 px-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{
            background:'rgba(255,255,255,0.12)',
            backdropFilter:'blur(20px)',
            border:'1.5px solid rgba(255,255,255,0.25)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.2)'
          }}>
          <Zap size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="font-black tracking-tight" style={{fontSize:'22px', color:'#fff'}}>
            <span style={{color:'#93c5fd'}}>Prime</span>Connect
          </h1>
          <p className="text-blue-200 mt-0.5" style={{fontSize:'11px'}}>Nigeria's #1 Digital Services Platform</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex flex-col px-5 relative z-10">
        <div className="bg-white p-7" 
          style={{
            borderRadius:'24px',
            boxShadow:'0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.08)',
          }}>
          
          {/* Header */}
          <div className="mb-5">
            <h2 className="font-black text-gray-900" style={{fontSize:'24px', letterSpacing:'-0.5px', lineHeight:'1.2'}}>Welcome back 👋</h2>
            <p className="text-gray-500 mt-1.5" style={{fontSize:'14px', fontWeight:'500', lineHeight:'1.5'}}>Sign in to your PrimeConnect account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl flex items-start gap-2.5"
              style={{background:'#fff1f2', border:'1.5px solid #fecdd3'}}>
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-600 font-medium" style={{fontSize:'13px'}}>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block font-bold text-gray-500 mb-2 uppercase tracking-widest" 
                style={{fontSize:'11px', letterSpacing:'0.08em'}}>Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Mail size={16} style={{color: focusedField === 'email' ? '#2563eb' : hasEmailError ? '#f87171' : '#94a3b8'}} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('email', !!hasEmailError)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-gray-600 uppercase tracking-wider" 
                  style={{fontSize:'11px', letterSpacing:'0.08em'}}>Password</label>
                <Link to="/forgot-password" 
                  className="font-bold text-blue-600" style={{fontSize:'12px'}}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock size={16} style={{color: focusedField === 'password' ? '#2563eb' : hasPasswordError ? '#f87171' : '#94a3b8'}} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('password', !!hasPasswordError)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  {showPassword 
                    ? <EyeOff size={16} className="text-gray-400" /> 
                    : <Eye size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
              disabled={isLoading}
              className="w-full text-white font-black mt-2 relative overflow-hidden select-none"
              style={{
                background: pressed
                  ? 'linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)'
                  : 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                borderRadius: '16px',
                height: '56px',
                fontSize: '16px',
                letterSpacing: '0.01em',
                boxShadow: pressed
                  ? '0 2px 6px rgba(37,99,235,0.3)'
                  : '0 4px 16px rgba(37,99,235,0.4), 0 1px 4px rgba(37,99,235,0.2)',
                transform: pressed ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isLoading ? 0.85 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}>
              {/* Ripple overlay */}
              {pressed && (
                <span className="absolute inset-0 rounded-2xl"
                  style={{background: 'rgba(255,255,255,0.08)'}} />
              )}
              {isLoading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span style={{fontSize:'15px', fontWeight:'700'}}>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span style={{fontSize:'16px', fontWeight:'800', letterSpacing:'0.02em'}}>Sign In</span>
                  <span style={{fontSize:'18px', marginTop:'1px'}}>→</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Create account link */}
        <p className="text-center text-blue-200 mt-5" style={{fontSize:'13px'}}>
          Don't have an account?{' '}
          <Link to="/register" 
            className="text-white font-black"
            style={{textDecoration:'underline', textUnderlineOffset:'3px'}}>
            Create one free
          </Link>
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-5 mt-4 pb-10">
          {[
            { icon: '🔒', text: '100% Secure' },
            { icon: '⚡', text: 'Instant' },
            { icon: '🇳🇬', text: 'Made in Nigeria' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-1.5">
              <span style={{fontSize:'13px'}}>{b.icon}</span>
              <span className="text-blue-200 font-medium" style={{fontSize:'11px'}}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
