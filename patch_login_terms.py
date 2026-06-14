from pathlib import Path

file = Path("src/pages/Login.tsx")
content = file.read_text()

old = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';"""

new = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';"""

if old in content:
    content = content.replace(old, new)
    print("Step 1 OK")
else:
    print("Step 1 FAILED")

old2 = """  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);"""

new2 = """  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);"""

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 2 OK")
else:
    print("Step 2 FAILED")

old3 = """  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }"""

new3 = """  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError('Please read and agree to our Terms & Conditions to continue.');
      return;
    }
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }"""

if old3 in content:
    content = content.replace(old3, new3)
    print("Step 3 OK")
else:
    print("Step 3 FAILED")

old4 = """              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;"""

new4 = """              {/* Terms Agreement */}
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
                    </button>{' '}and{' '}
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

      {/* Terms Modal */}
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
              <button
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm"
              >✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-5 text-sm text-gray-600 flex-1">
              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Please read these terms carefully before using PrimeConnect.</p>
              </div>
              {[
                { title: '1. Acceptance of Terms', body: 'By signing in to PrimeConnect, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.' },
                { title: '2. Eligibility', body: 'You must be at least 18 years old and a resident of Nigeria to use PrimeConnect services. By logging in, you confirm you meet these requirements.' },
                { title: '3. Account Security', body: 'You are solely responsible for maintaining the confidentiality of your login credentials. PrimeConnect will never ask for your password. Report any unauthorized access immediately.' },
                { title: '4. Wallet & Transactions', body: 'All wallet transactions are final and irreversible. PrimeConnect is not liable for losses resulting from incorrect transaction details. Always verify details before confirming.' },
                { title: '5. Prohibited Activities', body: 'You may not use PrimeConnect for fraudulent transactions, money laundering, chargebacks abuse, or any illegal activities. Violations result in immediate account suspension and reporting to relevant authorities.' },
                { title: '6. Service Availability', body: 'PrimeConnect strives for 24/7 availability but does not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance via the platform banner.' },
                { title: '7. Referral Program', body: 'Referral bonuses are credited only after the referred user funds their wallet with the minimum required amount. Abuse of the referral system results in permanent disqualification and bonus reversal.' },
                { title: '8. Privacy & Data', body: 'We collect your name, email, and phone number solely to provide our services. Your data is encrypted and never sold to third parties. You may request data deletion by contacting support.' },
                { title: '9. Dispute Resolution', body: 'Any disputes must be reported within 48 hours of the transaction. PrimeConnect reserves the right to investigate and make final decisions on all disputes.' },
                { title: '10. Support', body: 'For support, contact us at support.primeconnect@gmail.com or call +234 814 838 5682. We respond within 24 hours on business days.' },
              ].map((item) => (
                <div key={item.title} className="border-b border-gray-50 pb-4 last:border-0">
                  <p className="font-bold text-gray-900 mb-1.5 text-sm">{item.title}</p>
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
              <button
                onClick={() => setShowTerms(false)}
                className="w-full bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;"""

if old4 in content:
    content = content.replace(old4, new4)
    file.write_text(content)
    print("Step 4 OK: Login terms added!")
else:
    print("Step 4 FAILED")
    idx = content.find('Sign In')
    if idx != -1:
        print(repr(content[idx:idx+200]))
