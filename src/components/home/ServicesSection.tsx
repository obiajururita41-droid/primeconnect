import { Link } from 'react-router-dom';
import { Smartphone, Wifi, Receipt, Gift, MessageSquare, Wallet, ArrowRight } from 'lucide-react';

const services = [
  { icon: Smartphone, title: 'Airtime Purchase', desc: 'Buy airtime for all networks instantly at the best rates.', color: 'bg-blue-50 text-blue-600', route: '/services' },
  { icon: Wifi, title: 'Data Subscription', desc: 'Subscribe to affordable data plans for all networks.', color: 'bg-green-50 text-green-600', route: '/services' },
  { icon: Wallet, title: 'Wallet Funding', desc: 'Fund your wallet easily via bank transfer or card.', color: 'bg-purple-50 text-purple-600', route: '/services' },
  { icon: MessageSquare, title: 'Virtual SMS', desc: 'Send bulk SMS messages to any number nationwide.', color: 'bg-orange-50 text-orange-600', route: '/services' },
  { icon: Gift, title: 'Gift Card Trading', desc: 'Trade your gift cards at the best rates instantly.', color: 'bg-pink-50 text-pink-600', route: '/services' },
  { icon: Receipt, title: 'Bill Payments', desc: 'Pay electricity, TV subscriptions and more with ease.', color: 'bg-teal-50 text-teal-600', route: '/services' },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle mx-auto">Everything you need in one powerful platform</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, color, route }) => (
            <Link to={route} key={title} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
