import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, Users, Gift, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Referral {
  id: string;
  referred_id: string;
  bonus_paid: boolean;
  created_at: string;
  referred: { full_name: string; email: string } | null;
}

export default function ReferralPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = profile?.referral_code ?? '--------';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    if (user) fetchReferrals();
  }, [user]);

  async function fetchReferrals() {
    setLoading(true);
    const { data } = await supabase
      .from('referrals')
      .select('*, referred:referred_id(full_name, email)')
      .eq('referrer_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setReferrals(data as any);
    setLoading(false);
  }

  const totalEarned = referrals.filter(r => r.bonus_paid).length;
  const pending     = referrals.filter(r => !r.bonus_paid).length;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Join PrimeConnect and enjoy fast digital services! Use my referral code *${referralCode}* to sign up and get a bonus. ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Refer & Earn</h1>
            <p className="text-xs text-gray-400">Invite friends and earn rewards</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5" />
            <p className="font-bold">Earn rewards for every referral!</p>
          </div>
          <p className="text-sm text-blue-100 mb-4">
            Share your referral code with friends. When they sign up and fund their wallet, you both earn a bonus.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{referrals.length}</p>
              <p className="text-xs text-blue-100">Total</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{totalEarned}</p>
              <p className="text-xs text-blue-100">Earned</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{pending}</p>
              <p className="text-xs text-blue-100">Pending</p>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Your Referral Code</p>
          <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 mb-3">
            <span className="font-mono font-bold text-blue-600 text-xl tracking-widest">{referralCode}</span>
            <button onClick={copyCode} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-blue-500" />}
            </button>
          </div>

          {/* Referral Link */}
          <p className="text-sm font-medium text-gray-700 mb-2">Referral Link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-4">
            <p className="text-xs text-gray-500 flex-1 truncate">{referralLink}</p>
            <button onClick={copyLink} className="shrink-0">
              {copiedLink ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-xl text-sm hover:bg-green-600 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl text-sm hover:bg-blue-100 transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">My Referrals ({referrals.length})</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No referrals yet</p>
              <p className="text-gray-300 text-xs mt-1">Share your code to start earning</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {r.referred?.full_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.referred?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{r.referred?.email}</p>
                    <p className="text-xs text-gray-300">{new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                    r.bonus_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.bonus_paid ? '✅ Earned' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
