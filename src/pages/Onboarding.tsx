import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Gift, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: <Zap size={64} className="text-white" />,
    title: "Fast & Secure Payments",
    description: "Buy airtime, subscribe to data, and pay bills instantly. Available 24/7 with bank-level security.",
  },
  {
    icon: <Gift size={64} className="text-white" />,
    title: "Trade Gift Cards",
    description: "Get the best rates when trading your gift cards. Instant payment directly to your wallet.",
  },
  {
    icon: <Shield size={64} className="text-white" />,
    title: "Earn & Grow",
    description: "Refer friends, earn rewards, and grow your income. Withdraw anytime to your bank account.",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [iconBounce, setIconBounce] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIconBounce(true);
    const t = setTimeout(() => setIconBounce(false), 600);
    return () => clearTimeout(t);
  }, [current]);

  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/login', { replace: true });
  };

  const next = () => {
    if (animating) return;
    if (current < slides.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(current + 1);
        setAnimating(false);
      }, 300);
    } else {
      finish();
    }
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-900 flex flex-col items-center justify-between p-8 transition-all duration-500">
      
      {/* Skip */}
      <div className="w-full flex justify-end pt-4">
        <button onClick={finish} className="text-white/70 text-sm font-medium">Skip</button>
      </div>

      {/* Content */}
      <div
        className="flex flex-col items-center text-center gap-6 flex-1 justify-center"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateX(60px)' : 'translateX(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Icon */}
        <div
          className="bg-white/20 rounded-full p-8 mb-4"
          style={{
            transform: iconBounce ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {slide.icon}
        </div>

        <h1 className="text-3xl font-bold text-white">{slide.title}</h1>
        <p className="text-white/80 text-lg max-w-xs leading-relaxed">{slide.description}</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className="h-2 rounded-full cursor-pointer transition-all duration-300"
            style={{
              width: i === current ? '32px' : '8px',
              backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={next}
        className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg mb-4"
        style={{
          animation: 'pulse 2s infinite',
          boxShadow: '0 0 20px rgba(255,255,255,0.3)',
        }}
      >
        {current < slides.length - 1 ? 'Next' : 'Get Started'}
        <ChevronRight size={20} />
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 35px rgba(255,255,255,0.6); }
        }
      `}</style>
    </div>
  );
}
