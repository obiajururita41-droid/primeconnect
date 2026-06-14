from pathlib import Path

file = Path("src/components/admin/AdminSettingsTab.tsx")
content = file.read_text()

old = '''import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign } from 'lucide-react';
import PlatformSettingsTab from './PlatformSettingsTab';
import FinancialSettingsTab from './FinancialSettingsTab';

type SubTab = 'platform' | 'financial';'''

new = '''import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Zap } from 'lucide-react';
import PlatformSettingsTab from './PlatformSettingsTab';
import FinancialSettingsTab from './FinancialSettingsTab';
import ServicesSettingsTab from './ServicesSettingsTab';

type SubTab = 'platform' | 'financial' | 'services';'''

if old in content:
    content = content.replace(old, new)
    print("Step 1 OK")
else:
    print("Step 1 FAILED")

old2 = '''          <DollarSign className="w-4 h-4" /> Financial
        </button>
      </div>

      {subTab === 'platform' && <PlatformSettingsTab />}
      {subTab === 'financial' && <FinancialSettingsTab />}'''

new2 = '''          <DollarSign className="w-4 h-4" /> Financial
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
      {subTab === 'services' && <ServicesSettingsTab />}'''

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 2 OK")
else:
    print("Step 2 FAILED")

Path("src/components/admin/AdminSettingsTab.tsx").write_text(content)
