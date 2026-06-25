import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Buy Airtime & Data",
    description: "Instantly recharge any network — MTN, Airtel, Glo, 9mobile. Fast, cheap, and reliable 24/7.",
    emoji: "📱",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" style={{animationDuration:'2s'}} />
        <div className="absolute inset-4 rounded-full bg-blue-400/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2 border border-blue-100">
            <span className="text-5xl">📱</span>
            <div className="flex gap-1">
              {['MTN','Airtel','Glo'].map(n => (
                <span key={n} className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    bg: 'from-blue-600 to-blue-800',
    accent: '#60A5FA',
  },
  {
    title: "Pay Bills Instantly",
    description: "Pay electricity, TV subscriptions, betting wallets and more. Never miss a payment again.",
    emoji: "⚡",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" style={{animationDuration:'2.5s'}} />
        <div className="absolute inset-4 rounded-full bg-orange-400/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 border border-orange-100">
            <span className="text-5xl">⚡</span>
            <div className="w-20 h-2 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-orange-400 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-orange-500">INSTANT PAYMENT</span>
          </div>
        </div>
      </div>
    ),
    bg: 'from-orange-500 to-orange-700',
    accent: '#FB923C',
  },
  {
    title: "Transfer & Withdraw",
    description: "Send money to any bank account in Nigeria. Withdraw your earnings anytime, anywhere.",
    emoji: "💸",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{animationDuration:'3s'}} />
        <div className="absolute inset-4 rounded-full bg-green-400/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2 border border-green-100">
            <span className="text-5xl">💸</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-[10px]">🏦</span>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.1}s`}} />)}
              </div>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-[10px]">💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    bg: 'from-green-600 to-green-800',
    accent: '#4ADE80',
  },
  {
    title: "Earn While You Share",
    description: "Refer friends and earn up to 10% lifetime commission on every transaction they make.",
    emoji: "🎁",
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping" style={{animationDuration:'2s'}} />
        <div className="absolute inset-4 rounded-full bg-purple-400/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2 border border-purple-100">
            <span className="text-5xl">🎁</span>
            <div className="bg-purple-50 rounded-xl px-3 py-1">
              <span className="text-xs font-black text-purple-600">10% COMMISSION</span>
            </div>
          </div>
        </div>
      </div>
    ),
    bg: 'from-purple-600 to-purple-800',
    accent: '#C084FC',
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<'left'|'right'>('left');
  const navigate = useNavigate();
  const startX = useRef(0);

  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/login', { replace: true });
  };

  const next = () => {
    if (animating) return;
    if (current < slides.length - 1) {
      setSlideDir('left');
      setAnimating(true);
      setTimeout(() => { setCurrent(c => c + 1); setAnimating(false); }, 350);
    } else finish();
  };

  const prev = () => {
    if (animating || current === 0) return;
    setSlideDir('right');
    setAnimating(true);
    setTimeout(() => { setCurrent(c => c - 1); setAnimating(false); }, 350);
  };

  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
  };

  const slide = slides[current];

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-b ${slide.bg} transition-all duration-500`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      <div className="flex justify-between items-center px-6 pt-12">
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} className="cursor-pointer h-1.5 rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 8, background: i === current ? 'white' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
        <button onClick={finish} className="text-white/70 text-sm font-semibold bg-white/10 px-4 py-1.5 rounded-full">Skip</button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8"
        style={{ opacity: animating ? 0 : 1, transform: animating ? `translateX(${slideDir === 'left' ? '40px' : '-40px'})` : 'translateX(0)', transition: 'all 0.35s ease' }}>
        
        {/* Illustration */}
        <div className="mb-8">{slide.illustration}</div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-3 leading-tight">{slide.title}</h1>
          <p className="text-white/75 text-base leading-relaxed max-w-xs">{slide.description}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-12">
        {/* Trust badges */}
        <div className="flex justify-center gap-4 mb-6">
          {['🔒 Secure', '⚡ Instant', '🇳🇬 Nigerian'].map(badge => (
            <span key={badge} className="text-white/60 text-xs font-medium">{badge}</span>
          ))}
        </div>

        {/* Button */}
        <button onClick={next}
          className="w-full bg-white font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ color: '#1d4ed8', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          {current < slides.length - 1 ? (
            <>Next <span className="text-lg">→</span></>
          ) : (
            <>Get Started <span className="text-lg">🚀</span></>
          )}
        </button>

        {current === slides.length - 1 && (
          <p className="text-center text-white/50 text-xs mt-4">
            Already have an account?{' '}
            <button onClick={() => { localStorage.setItem('onboarding_done', 'true'); navigate('/login'); }} className="text-white font-bold">Sign In</button>
          </p>
        )}
      </div>
    </div>
  );
}
