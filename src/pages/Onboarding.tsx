import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Buy Airtime & Data",
    description: "Instantly recharge any network — MTN, Airtel, Glo, 9mobile. Fast, cheap, and reliable 24/7.",
    illustration: (
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-6 rounded-full bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3">
            <span className="text-6xl">📱</span>
            <div className="flex gap-1">
              {['MTN', 'Airtel', 'Glo'].map(n => (
                <span key={n} className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Pay Bills Instantly",
    description: "Pay electricity, TV subscriptions, betting wallets and more. Never miss a payment again.",
    illustration: (
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2.5s' }} />
        <div className="absolute inset-6 rounded-full bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3">
            <span className="text-6xl">⚡</span>
            <div className="w-20 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-blue-600">INSTANT PAYMENT</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Transfer & Withdraw",
    description: "Send money to any bank account in Nigeria. Withdraw your earnings anytime, anywhere.",
    illustration: (
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-6 rounded-full bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3">
            <span className="text-6xl">💸</span>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🏦</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Earn & Refer",
    description: "Refer friends and earn up to 10% lifetime commission on every transaction they make.",
    illustration: (
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-6 rounded-full bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3">
            <span className="text-6xl">🎁</span>
            <div className="bg-blue-50 rounded-xl px-3 py-1.5">
              <span className="text-xs font-black text-blue-600">10% COMMISSION</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
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
    } else {
      finish();
    }
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
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center px-6 pt-14 pb-2">
        <div className="flex gap-2 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 28 : 8,
                background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
        <button
          onClick={finish}
          className="text-white/80 text-sm font-semibold bg-white/15 px-4 py-1.5 rounded-full active:bg-white/25"
        >
          Skip
        </button>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-6"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? `translateX(${slideDir === 'left' ? '40px' : '-40px'})` : 'translateX(0)',
          transition: 'all 0.35s ease',
        }}
      >
        <div className="mb-10">{slide.illustration}</div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-4 leading-tight">{slide.title}</h1>
          <p className="text-white/75 text-base leading-relaxed max-w-xs mx-auto">{slide.description}</p>
        </div>
      </div>

      <div className="px-6 pb-14">
        <div className="flex justify-center gap-5 mb-7">
          {['🔒 Secure', '⚡ Instant', '🇳🇬 Nigerian'].map(badge => (
            <span key={badge} className="text-white/60 text-xs font-semibold">{badge}</span>
          ))}
        </div>
        <button
          onClick={next}
          className="w-full bg-white font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ color: '#1d4ed8', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
        >
          {current < slides.length - 1 ? <>Next <span className="text-lg">→</span></> : <>Get Started <span className="text-lg">🚀</span></>}
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
