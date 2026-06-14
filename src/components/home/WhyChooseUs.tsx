import { Shield, Zap, HeadphonesIcon, BadgeCheck, TrendingDown, Users } from 'lucide-react';

const reasons = [
  { icon: Zap, title: 'Instant Delivery', desc: 'All transactions are processed and delivered within seconds, 24/7.', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield, title: 'Bank-Level Security', desc: 'Your data and funds are protected with enterprise-grade encryption.', color: 'bg-green-50 text-green-600' },
  { icon: TrendingDown, title: 'Best Rates', desc: 'We offer the most competitive prices for all our services in Nigeria.', color: 'bg-orange-50 text-orange-600' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Our support team is always available via WhatsApp, email and phone.', color: 'bg-purple-50 text-purple-600' },
  { icon: BadgeCheck, title: 'Verified Platform', desc: 'Fully registered and verified Nigerian fintech platform you can trust.', color: 'bg-teal-50 text-teal-600' },
  { icon: Users, title: 'Referral Rewards', desc: 'Earn cash rewards every time you refer a friend to PrimeConnect.', color: 'bg-pink-50 text-pink-600' },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="section-title">Why Choose PrimeConnect?</h2>
          <p className="section-subtitle mx-auto">We are committed to giving you the best digital experience</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
