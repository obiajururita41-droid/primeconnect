import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { value: '2026', label: 'Founded' },
    { value: 'New', label: 'Platform' },
    { value: '100%', label: 'Secure' },
    { value: '24/7', label: 'Support' },
  ];

  const team = [
    { name: 'Obiajuru Rita', role: 'Founder & CEO', initial: 'OR', desc: 'Visionary leader driving PrimeConnect mission to simplify digital finance for every Nigerian.' },
    { name: 'Obiajuru Ifeanyi', role: 'Co-Founder & CTO', initial: 'OI', desc: 'Tech architect behind PrimeConnect fast, secure, and scalable platform infrastructure.' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Trust & Security',
      description: 'Bank-level encryption protects every transaction you make on our platform.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Speed & Reliability',
      description: 'Instant delivery on every service — airtime, data, bills and more in seconds.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Customer First',
      description: 'Everything we build starts with one question — does this make life easier for our users?',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
      title: 'Built for Nigeria',
      description: 'Designed specifically for the Nigerian market — local networks, local bills, local needs.',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          About PrimeConnect
        </div>
        <h1 className="text-3xl font-bold mb-4">Powering Nigeria's Digital Transactions</h1>
        <p className="text-blue-100 text-sm leading-relaxed max-w-sm mx-auto">
          We're on a mission to make everyday digital services — airtime, data, bills, and more — fast, affordable, and accessible to every Nigerian.
        </p>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            PrimeConnect was founded in 2026 by a team of Nigerian tech entrepreneurs who were frustrated by slow, unreliable, and expensive digital transaction platforms.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            We built PrimeConnect from the ground up with one goal: to give every Nigerian access to fast, secure, and affordable digital services — from buying airtime to trading gift cards — all in one place.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            We're a new platform built to give every Nigerian fast, secure, and affordable digital services — and we're just getting started.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What We Stand For</h2>
          <div className="space-y-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{v.title}</div>
                  <div className="text-gray-500 text-sm mt-1 leading-relaxed">{v.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Meet the Team</h2>
          <p className="text-sm text-gray-500 text-center mb-8">The people building PrimeConnect</p>
          <div className="space-y-4">
            {team.map((member, i) => (
              <div key={member.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0 ${
                  i === 0 ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                  {member.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-gray-900 text-sm">{member.name}</p>
                    {i === 0 && (
                      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">CEO</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">{member.role}</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
        <p className="text-blue-100 text-sm mb-6">Join PrimeConnect today.</p>
        <Link
          to="/register"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Create Free Account
        </Link>
      </section>

    </div>
  );
};

export default About;
