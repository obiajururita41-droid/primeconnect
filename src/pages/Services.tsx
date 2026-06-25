import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Smartphone, Wifi, Gift, MessageSquare, Wallet, TrendingUp,
  ArrowRight, CheckCircle, Zap, Shield, Clock
} from 'lucide-react';

const services = [
  {
    icon: Smartphone,
    title: 'Airtime Purchase',
    desc: 'Buy airtime for MTN, Airtel, Glo, and 9mobile instantly at the best rates. Available 24/7 with instant delivery.',
    color: 'bg-blue-50 text-blue-600',
    features: ['All networks supported', 'Instant delivery', 'Best rates guaranteed'],
  },
  {
    icon: Wifi,
    title: 'Data Subscription',
    desc: 'Subscribe to affordable data plans for all networks. Daily, weekly, and monthly plans available.',
    color: 'bg-green-50 text-green-600',
    features: ['All networks', 'Flexible plans', 'Auto-renewal option'],
  },

  {
    icon: Gift,
    title: 'Gift Card Trading',
    desc: 'Trade your Amazon, iTunes, Steam, Google Play and other gift cards at the best rates instantly.',
    color: 'bg-pink-50 text-pink-600',
    features: ['Best exchange rates', 'Fast payment', 'Multiple card types'],
  },
  {
    icon: MessageSquare,
    title: 'Virtual SMS',
    desc: 'Send bulk SMS messages to any number nationwide. Perfect for businesses and personal use.',
    color: 'bg-orange-50 text-orange-600',
    features: ['Bulk messaging', 'Custom sender ID', 'Delivery reports'],
  },
  {
    icon: Wallet,
    title: 'Wallet Funding',
    desc: 'Fund your PrimeConnect wallet easily via bank transfer, USSD, or card payment. Instant credit.',
    color: 'bg-purple-50 text-purple-600',
    features: ['Bank transfer', 'Card payment', 'USSD support'],
  },
  {
    icon: TrendingUp,
    title: 'Airtime to Cash',
    desc: 'Convert your excess airtime to cash instantly. Best rates for MTN, Airtel, Glo and 9mobile.',
    color: 'bg-yellow-50 text-yellow-600',
    features: ['All networks', 'Instant payment', 'Best rates'],
  },
  {
    icon: TrendingUp,
    title: 'Betting Wallet Funding',
    desc: 'Fund your Sportybet, Bet9ja, 1xBet and other betting wallets instantly.',
    color: 'bg-red-50 text-red-600',
    features: ['All betting platforms', 'Instant credit', '24/7 available'],
  },
];

const whyUs = [
  { icon: Zap, title: 'Instant Delivery', desc: 'All transactions processed in seconds' },
  { icon: Shield, title: 'Secure & Safe', desc: 'Bank-level encryption on all payments' },
  { icon: Clock, title: '24/7 Service', desc: 'Available round the clock, every day' },
];

const Services = () => {
  const navigate = useNavigate();
  const isCapacitor = window.location.hostname === 'localhost';
  useEffect(() => {
    if (isCapacitor) navigate('/dashboard', { replace: true });
  }, []);
  if (isCapacitor) return null;
  return (
    <div className="pt-16 min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" /> All Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need,<br />
            <span className="text-blue-200">One Platform</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto mb-8">
            Buy airtime, subscribe to data, pay bills, trade gift cards and more — all in one place. Instant delivery, 24/7.
          </p>
          <Link to="/register" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition-all duration-200 inline-block">
            Get Started Free →
          </Link>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle mx-auto">Tap any service to get started</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, color, features }) => (
              <div key={title} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all mt-auto">
                  Get started <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">
            Join PrimeConnect for fast, reliable digital services.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-xl hover:bg-blue-50 transition-all">
              Create Free Account
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
