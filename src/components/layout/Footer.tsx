import { Link } from 'react-router-dom';
import { Zap, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Prime<span className="text-blue-400">Connect</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nigeria's most reliable platform for airtime, data, bill payments and digital services.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors text-sm px-3">FB</a>
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors text-sm px-3">TW</a>
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-colors text-sm px-3">IG</a>
              <a href="https://wa.me/2348000000000" className="bg-gray-800 hover:bg-green-600 p-2 rounded-lg transition-colors"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['Home','/'],['Services','/services'],['About','/about'],['FAQ','/faq'],['Contact','/contact']].map(([label,href])=>(
                <li key={href}><Link to={href} className="text-gray-400 hover:text-blue-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {['Airtime Purchase','Data Subscription','Bill Payments','Gift Card Trading','Virtual SMS','Wallet Funding'].map(s=>(
                <li key={s}><Link to="/services" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400 text-sm"><Phone className="w-4 h-4 text-blue-400" /><span>+234 814 838 5682</span></li>
              <li className="flex items-center space-x-2 text-gray-400 text-sm"><Mail className="w-4 h-4 text-blue-400" /><span>support.primeconnect@gmail.com</span></li>
              <li className="flex items-center space-x-2 text-gray-400 text-sm"><MapPin className="w-4 h-4 text-blue-400" /><span>Delta State, Nigeria</span></li>
            </ul>
            <div className="mt-6 bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Subscribe to newsletter</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 bg-gray-700 text-white text-xs px-3 py-2 rounded-lg outline-none" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-colors">Go</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 PrimeConnect. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
