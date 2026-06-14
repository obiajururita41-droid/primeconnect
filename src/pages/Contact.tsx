import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';

const contactInfo = [
  { icon: Phone, title: 'Phone / WhatsApp', value: '+234 814 838 5682', desc: 'Mon - Sat, 8am to 8pm', color: 'bg-green-50 text-green-600', href: 'tel:+2348148385682' },
  { icon: Mail, title: 'Email', value: 'support.primeconnect@gmail.com', desc: 'We reply within 24 hours', color: 'bg-blue-50 text-blue-600', href: 'mailto:support.primeconnect@gmail.com' },
  { icon: MapPin, title: 'Office', value: 'Delta State, Nigeria', desc: 'Visit by appointment only', color: 'bg-pink-50 text-pink-600', href: '#' },
  { icon: Clock, title: 'Support Hours', value: '24/7 Online Support', desc: 'Always here to help', color: 'bg-purple-50 text-purple-600', href: '#' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('loading');
    await new Promise(res => setTimeout(res, 1500));
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Contact Us</h1>
        <p className="text-gray-500 text-center mb-10">We are here to help you</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {contactInfo.map((item, i) => (
            <a key={i} href={item.href} className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-700">{item.value}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
        {status === 'success' ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h2 className="text-xl font-bold mb-1">Message Sent!</h2>
            <p className="text-gray-500">We will get back to you within 24 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-4 text-blue-600 underline">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h2 className="font-semibold text-lg">Send a Message</h2>
            </div>
            <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required className="w-full border rounded-lg px-4 py-2 text-sm" />
            <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} required className="w-full border rounded-lg px-4 py-2 text-sm" />
            <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required className="w-full border rounded-lg px-4 py-2 text-sm" />
            <textarea name="message" placeholder="Your message..." value={form.message} onChange={handleChange} required rows={4} className="w-full border rounded-lg px-4 py-2 text-sm" />
            <button type="submit" disabled={status === 'loading'} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition">
              <Send size={16} />
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
