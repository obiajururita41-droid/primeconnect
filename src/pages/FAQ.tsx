import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Zap, MessageCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'What is PrimeConnect?', a: 'PrimeConnect is Nigeria\'s reliable platform for buying airtime, subscribing to data, paying bills, trading gift cards, and more — all in one place with instant delivery.' },
      { q: 'How do I create an account?', a: 'Click "Get Started" on the homepage, fill in your name, email, and password, then verify your email. Your account will be ready in under 2 minutes.' },
      { q: 'Is PrimeConnect free to use?', a: 'Yes! Creating an account is completely free. You only pay for the services you use, and our rates are among the best in Nigeria.' },
    ],
  },
  {
    category: 'Payments & Wallet',
    items: [
      { q: 'How do I fund my wallet?', a: 'You can fund your wallet via bank transfer, debit/credit card, or USSD. All payments are processed instantly and your wallet is credited immediately.' },
      { q: 'What payment methods are accepted?', a: 'We accept all Nigerian bank cards (Verve, Mastercard, Visa), bank transfers to our dedicated account, and major USSD codes.' },
      { q: 'Is my payment information safe?', a: 'Absolutely. We use bank-level SSL encryption for all transactions. We never store your card details — payments are handled by our certified payment processor.' },
      { q: 'Can I get a refund?', a: 'If a transaction fails and your wallet was debited, the amount is automatically reversed within minutes. For other refund requests, contact our support team.' },
    ],
  },
  {
    category: 'Services',
    items: [
      { q: 'Which networks are supported for airtime and data?', a: 'We support all major Nigerian networks: MTN, Airtel, Glo, and 9mobile. Both airtime purchase and data subscription are available for all four networks.' },
      { q: 'How fast is airtime/data delivery?', a: 'Delivery is instant — typically under 5 seconds. In rare cases of network delays, it may take up to 2 minutes. If not received after 5 minutes, contact support.' },
      { q: 'What gift cards can I trade?', a: 'We currently trade Amazon, iTunes/Apple, Google Play, Steam, and several other popular gift cards. Rates are updated regularly to give you the best value.' },
      { q: 'What bills can I pay on PrimeConnect?', a: 'You can pay for DSTV, GOtv, Startimes subscriptions, electricity bills (prepaid tokens) for all DISCOs, and more. More billers are added regularly.' },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your registered email, and we\'ll send you a reset link. The link expires after 30 minutes.' },
      { q: 'Can I change my registered email or phone number?', a: 'Yes. Go to your Dashboard settings to update your contact details. You\'ll need to verify any new email or phone number before it takes effect.' },
      { q: 'How do I contact support?', a: 'You can reach us via email at support.primeconnect@gmail.com, call +234 814 838 5682, or use the live chat on our Contact page. We\'re available 24/7.' },
    ],
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white">
          <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{a}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...faqs.map(f => f.category)];
  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="pt-16 min-h-screen">
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" /> Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked<br />
            <span className="text-blue-200">Questions</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Find answers to common questions about PrimeConnect's services, payments, and account management.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-10">
            {filtered.map(group => (
              <div key={group.category}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{group.category}</h2>
                <div className="space-y-3">
                  {group.items.map(item => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Can't find what you're looking for? Our support team is available 24/7 to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="btn-primary text-sm">Contact Support</Link>
              <a href="mailto:support.primeconnect@gmail.com" className="btn-secondary text-sm">Email Us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
