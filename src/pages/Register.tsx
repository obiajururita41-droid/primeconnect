import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Shield, CheckCircle } from 'lucide-react';
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
    name: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.phone) return setError('Please fill in all required fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address.');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) return setError('You must agree to our Terms & Conditions.');
    if (!form.password || !form.confirmPassword) return setError('Please fill in all fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true);
    const { error: regError } = await register(form.email, form.password, form.name, form.phone, form.referralCode || undefined);
    setIsLoading(false);
    if (!regError) navigate('/dashboard');
    else setError(regError?.message || 'Registration failed. Please try again.');
  };

  const inputClass = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">
            <span className="text-blue-200">Prime</span>Connect
          </h1>
          <p className="text-blue-200 text-xs mt-1">Create your free account</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1 ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}>1</div>
          <div className={`h-1 w-12 rounded transition-all ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === 2 ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}>2</div>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-400 text-xs">Step 1 of 2</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <input name="phone" type="tel" placeholder="08012345678" value={form.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Referral Code <span className="text-gray-400 font-normal">(optional)</span></label>
                <input name="referralCode" type="text" placeholder="e.g. PRIME001" value={form.referralCode} onChange={handleChange} className={inputClass} />
              </div>
              <button onClick={handleNext}
                className="w-full text-white font-bold py-3.5 rounded-xl mt-2"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Set Password</h2>
                <p className="text-gray-400 text-xs">Step 2 of 2</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange} className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length >= (i + 1) * 2
                          ? form.password.length < 6 ? 'bg-red-400' : form.password.length < 8 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={handleChange} className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && (
                  <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreedToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    I agree to PrimeConnect's{' '}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-semibold underline">Terms & Conditions</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-semibold underline">Privacy Policy</button>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={isLoading || !agreedToTerms}
                  className="flex-1 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-blue-200 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-bold">Sign in</Link>
        </p>
      </div>

      {/* Bottom badges */}
      <div className="flex justify-center gap-6 pb-8">
        <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>🔒</span> 100% Secure</div>
        <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>⚡</span> Instant Setup</div>
        <div className="flex items-center gap-1.5 text-blue-200 text-xs"><span>🇳🇬</span> Made in Nigeria</div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Terms & Conditions</h3>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4 text-sm text-gray-600 flex-1">
              {[
                { t: '1. Acceptance', b: 'By creating an account on PrimeConnect, you agree to be bound by these Terms and Conditions.' },
                { t: '2. Eligibility', b: 'You must be at least 18 years old and a resident of Nigeria to use PrimeConnect services.' },
                { t: '3. Account Security', b: 'You are responsible for maintaining the confidentiality of your account credentials.' },
                { t: '4. Transactions', b: 'All wallet transactions are final. Ensure all details are correct before confirming.' },
                { t: '5. Prohibited Activities', b: 'You may not use PrimeConnect for fraudulent transactions or illegal activities.' },
                { t: '6. Referral Program', b: 'Referral bonuses are credited after the referred user funds their wallet.' },
                { t: '7. Privacy', b: 'We collect your name, email, and phone number to provide our services. Your data is never sold.' },
                { t: '8. Support', b: 'Contact us at support.primeconnect@gmail.com or +234 814 838 5682.' },
              ].map(item => (
                <div key={item.t} className="border-b border-gray-50 pb-3 last:border-0">
                  <p className="font-bold text-gray-900 mb-1">{item.t}</p>
                  <p>{item.b}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t shrink-0">
              <button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
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
