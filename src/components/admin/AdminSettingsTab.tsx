import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Zap } from 'lucide-react';
import PlatformSettingsTab from './PlatformSettingsTab';
import FinancialSettingsTab from './FinancialSettingsTab';
import ServicesSettingsTab from './ServicesSettingsTab';

type SubTab = 'platform' | 'financial' | 'services';

export default function AdminSettingsTab() {
  const [subTab, setSubTab] = useState<SubTab>('platform');

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        <button
          onClick={() => setSubTab('platform')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
            subTab === 'platform' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4" /> Platform
        </button>
        <button
          onClick={() => setSubTab('financial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
            subTab === 'financial' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Financial
        </button>
        <button
          onClick={() => setSubTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
            subTab === 'services' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          <Zap className="w-4 h-4" /> Services
        </button>
      </div>

      {subTab === 'platform' && <PlatformSettingsTab />}
      {subTab === 'financial' && <FinancialSettingsTab />}
      {subTab === 'services' && <ServicesSettingsTab />}
    </div>
  );
}
