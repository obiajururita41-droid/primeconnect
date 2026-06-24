import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Country { code: string; name: string; flag: string; }
interface Props { countries: Country[]; selected: Country; onChange: (c: Country) => void; }

export default function CountryDropdown({ countries, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
        <span className="text-2xl">{selected.flag}</span>
        <span className="font-bold text-gray-900 flex-1 text-left">{selected.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search country..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400" />
              {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-sm text-gray-400 py-6">No countries found</p>
              : filtered.map(c => (
                <button key={c.code} onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left ${c.code === selected.code ? 'bg-blue-50' : ''}`}>
                  <span className="text-xl">{c.flag}</span>
                  <span className={`text-sm ${c.code === selected.code ? 'font-bold text-blue-600' : 'font-medium text-gray-700'}`}>{c.name}</span>
                  {c.code === selected.code && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
