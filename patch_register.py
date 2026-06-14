from pathlib import Path

file = Path("src/pages/Register.tsx")
content = file.read_text()

old = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';"""

new = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';"""

if old in content:
    content = content.replace(old, new)
    print("Step 1 OK: imports")
else:
    print("Step 1 FAILED")

old2 = "  const [step, setStep] = useState(1);"
new2 = """  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);"""

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 2 OK: states")
else:
    print("Step 2 FAILED")

old3 = """  const handleSubmit = async () => {
    if (!form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }"""

new3 = """  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError('You must agree to our Terms & Conditions to continue.');
      return;
    }
    if (!form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }"""

if old3 in content:
    content = content.replace(old3, new3)
    print("Step 3 OK: terms validation")
else:
    print("Step 3 FAILED")

old4 = """            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Set Your Password</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
              </div>
            )}"""

new4 = """            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Set Your Password</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
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
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <p className={`text-xs mt-1 ${form.password === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
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
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-blue-600 font-semibold underline"
                      >
                        Terms & Conditions
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-blue-600 font-semibold underline"
                      >
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !agreedToTerms}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            {/* Terms Modal */}
            {showTerms && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-0">
                <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
                  <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Terms & Conditions</h3>
                    </div>
                    <button onClick={() => setShowTerms(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">✕</button>
                  </div>
                  <div className="overflow-y-auto p-5 space-y-4 text-sm text-gray-600">
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
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => { setAgreedToTerms(true); setShowTerms(false); }}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      I Agree & Continue
                    </button>
                  </div>
                </div>
              </div>
            )}"""

if old4 in content:
    content = content.replace(old4, new4)
    file.write_text(content)
    print("Step 4 OK: UI updated!")
else:
    print("Step 4 FAILED")
    idx = content.find('step === 2')
    if idx != -1:
        print(repr(content[idx:idx+200]))
