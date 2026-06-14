import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    setIsLoading(true);
    const { error: loginError } = await login(form.email, form.password);
    setIsLoading(false);
    if (!loginError) {
      const { data: { session } } = await supabase.auth.getSession();
const u = session?.user;
      let dest = '/dashboard';
      if (u) {
        const { data: adminRow } = await supabase.from('admin_users').select('role').eq('user_id', u.id).eq('is_active', true).single();
        if (adminRow && ['admin','super_admin'].includes(adminRow.role)) dest = '/admin';
      }
      navigate(dest);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-blue-600">Prime</span>Connect
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your PrimeConnect account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
              {/* Terms Agreement */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    I agree to PrimeConnect's{' '}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-semibold underline">
                      Terms & Conditions
                    </button>{' '}and{' '}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-semibold underline">
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !agreedToTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-2"
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

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
        </p>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Terms & Conditions</h3>
                  <p className="text-[10px] text-gray-400">PrimeConnect Platform Rules</p>
                </div>
              </div>
              <button onClick={() => setShowTerms(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Please read these terms carefully before using PrimeConnect.</p>
              </div>
              {[
                { title: '1. Acceptance of Terms', body: 'By signing in to PrimeConnect, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.' },
                { title: '2. Eligibility', body: 'You must be at least 18 years old and a resident of Nigeria to use PrimeConnect. By logging in, you confirm you meet these requirements.' },
                { title: '3. Account Security', body: 'You are solely responsible for maintaining the confidentiality of your login credentials. PrimeConnect will never ask for your password. Report any unauthorized access immediately.' },
                { title: '4. Wallet & Transactions', body: 'All wallet transactions are final and irreversible. PrimeConnect is not liable for losses from incorrect transaction details. Always verify before confirming.' },
                { title: '5. Prohibited Activities', body: 'You may not use PrimeConnect for fraud, money laundering, or illegal activities. Violations result in immediate suspension and reporting to authorities.' },
                { title: '6. Service Availability', body: 'PrimeConnect strives for 24/7 availability but does not guarantee uninterrupted service. Maintenance will be communicated via the platform banner.' },
                { title: '7. Referral Program', body: 'Referral bonuses are credited only after the referred user funds their wallet with the minimum required amount. Abuse results in disqualification and bonus reversal.' },
                { title: '8. Privacy & Data', body: 'We collect your name, email, and phone number solely to provide our services. Your data is encrypted and never sold to third parties.' },
                { title: '9. Dispute Resolution', body: 'Disputes must be reported within 48 hours of the transaction. PrimeConnect reserves the right to investigate and make final decisions on all disputes.' },
                { title: '10. Support', body: 'Contact us at support.primeconnect@gmail.com or +234 814 838 5682. We respond within 24 hours on business days.' },
              ].map((item) => (
                <div key={item.title} className="border-b border-gray-50 pb-4 last:border-0">
                  <p className="font-bold text-gray-900 mb-1 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
              <button
                onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> I Agree & Continue
              </button>
              <button onClick={() => setShowTerms(false)}
                className="w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
