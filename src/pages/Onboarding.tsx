import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Gift, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: <Zap size={64} className="text-white" />,
    title: "Fast & Secure Payments",
    description: "Buy airtime, subscribe to data, and pay bills instantly. Available 24/7 with bank-level security.",
    bg: "from-blue-600 to-blue-800",
  },
  {
    icon: <Gift size={64} className="text-white" />,
    title: "Trade Gift Cards",
    description: "Get the best rates when trading your gift cards. Instant payment directly to your wallet.",
    bg: "from-purple-600 to-purple-800",
  },
  {
    icon: <Shield size={64} className="text-white" />,
    title: "Earn & Grow",
    description: "Refer friends, earn rewards, and grow your income. Withdraw anytime to your bank account.",
    bg: "from-green-600 to-green-800",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const finish = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/', { replace: true });
  };

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else finish();
  };

  const slide = slides[current];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${slide.bg} flex flex-col items-center justify-between p-8 transition-all duration-500`}>
      <div className="w-full flex justify-end pt-4">
        <button onClick={finish} className="text-white/70 text-sm font-medium">Skip</button>
      </div>
      <div className="flex flex-col items-center text-center gap-6 flex-1 justify-center">
        <div className="bg-white/20 rounded-full p-8 mb-4">
          {slide.icon}
        </div>
        <h1 className="text-3xl font-bold text-white">{slide.title}</h1>
        <p className="text-white/80 text-lg max-w-xs leading-relaxed">{slide.description}</p>
      </div>
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
          />
        ))}
      </div>
      <button
        onClick={next}
        className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg mb-4"
      >
        {current < slides.length - 1 ? 'Next' : 'Get Started'}
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
