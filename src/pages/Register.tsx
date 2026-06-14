import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError('You must agree to our Terms & Conditions to continue.');
      return;
    }
    if (!form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const { error: regError } = await register(form.email, form.password, form.name, form.phone, form.referralCode || undefined);
    setIsLoading(false);
    if (!regError) {
      navigate('/dashboard');
    } else {
      setError(regError?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Enjoy fast, seamless transactions</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
          <div className={`h-1 w-12 rounded ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Personal Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input name="phone" type="tel" placeholder="08012345678" value={form.phone} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code <span className="text-gray-400 font-normal">(optional)</span></label>
                <input name="referralCode" type="text" placeholder="e.g. PRIME001" value={form.referralCode} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors mt-2">
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Set Your Password</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= (i + 1) * 2
                          ? form.password.length < 6 ? 'bg-red-400'
                          : form.password.length < 8 ? 'bg-yellow-400'
                          : 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                    }`}>
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

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={isLoading || !agreedToTerms}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Terms & Conditions</h3>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 text-sm text-gray-600 flex-1">
              <div>
                <p className="font-bold text-gray-900 mb-1">1. Acceptance of Terms</p>
                <p>By creating an account on PrimeConnect, you agree to be bound by these Terms and Conditions. If you do not agree, please do not register.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">2. Eligibility</p>
                <p>You must be at least 18 years old and a resident of Nigeria to use PrimeConnect services.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">3. Account Security</p>
                <p>You are responsible for maintaining the confidentiality of your account credentials. PrimeConnect will never ask for your password.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">4. Wallet & Transactions</p>
                <p>All wallet transactions are final. PrimeConnect is not liable for losses due to incorrect details provided during transactions. Ensure all details are correct before confirming.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">5. Prohibited Activities</p>
                <p>You may not use PrimeConnect for fraudulent transactions, money laundering, or any illegal activities. Violations will result in immediate account suspension and reporting to authorities.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">6. Referral Program</p>
                <p>Referral bonuses are credited after the referred user funds their wallet with the minimum required amount. Abuse of the referral program will result in disqualification.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">7. Privacy Policy</p>
                <p>We collect your name, email, and phone number to provide our services. Your data is never sold to third parties. We use industry-standard encryption to protect your information.</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">8. Support</p>
                <p>For support, contact us at support.primeconnect@gmail.com or call +234 814 838 5682. We respond within 24 hours on business days.</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0">
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
