import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 100, suffix: '%', label: 'Secure Transactions' },
  { value: 24, suffix: '/7', label: 'Always Available' },
  { value: 0, suffix: '%', prefix: '', label: 'Hidden Charges' },
  { value: 2026, suffix: '', label: 'Founded' },
];

const useCounter = (target: number, duration = 2000, start: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const StatCard = ({ value, suffix, prefix, label, start }: any) => {
  const count = useCounter(value, 2000, start);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm font-medium">{label}</div>
    </div>
  );
};

const StatsSection = () => {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} start={started} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
