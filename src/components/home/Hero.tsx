import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>
      <div className="container-custom relative z-10 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Nigeria's #1 Digital Services Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Fast, Secure &<br />
            <span className="text-blue-200">Reliable Services</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
            Buy airtime, subscribe to data, pay bills, trade gift cards and more — all in one place. Instant delivery, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/services" className="border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-8 rounded-xl transition-all duration-200 text-center">
              View Services
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { icon: Shield, text: '100% Secure' },
              { icon: Zap, text: 'Instant Delivery' },
              { icon: Clock, text: '24/7 Support' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-blue-100">
                <Icon className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
