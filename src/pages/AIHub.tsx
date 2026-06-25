import { useState } from 'react';
import BottomNav from '../components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles, Image, Video, Mic, PenTool, Briefcase,
  Share2, Search, Zap, Star, BookOpen, Plus,
  ChevronRight, ArrowLeft, Wand2, FileText,
  Hash, Calendar, Package, Megaphone, DollarSign,
  Music2
} from 'lucide-react';

const AI_MODULES = [
  {
    id: 'image',
    label: 'AI Image Studio',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    tools: [
      { id: 'logo', label: 'Logo Generator', icon: Star, prompt: 'Generate a professional logo for: ' },
      { id: 'flyer', label: 'Flyer Generator', icon: FileText, prompt: 'Create a promotional flyer for: ' },
      { id: 'product', label: 'Product Image', icon: Package, prompt: 'Generate a product image for: ' },
      { id: 'social', label: 'Social Media Post', icon: Share2, prompt: 'Create a social media post image for: ' },
      { id: 'thumbnail', label: 'Thumbnail Generator', icon: Image, prompt: 'Generate a YouTube thumbnail for: ' },
    ]
  },
  {
    id: 'writing',
    label: 'AI Writing Studio',
    icon: PenTool,
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tools: [
      { id: 'caption', label: 'Caption Generator', icon: FileText, prompt: 'Write engaging captions for: ' },
      { id: 'adcopy', label: 'Ad Copy Generator', icon: Megaphone, prompt: 'Write a compelling ad copy for: ' },
      { id: 'product-desc', label: 'Product Description', icon: Package, prompt: 'Write a product description for: ' },
      { id: 'blog', label: 'Blog Writer', icon: BookOpen, prompt: 'Write a blog post about: ' },
    ]
  },
  {
    id: 'business',
    label: 'Business AI',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    tools: [
      { id: 'bizname', label: 'Business Name Generator', icon: Star, prompt: 'Generate business names for: ' },
      { id: 'marketing', label: 'Marketing Plan', icon: Megaphone, prompt: 'Create a marketing plan for: ' },
      { id: 'invoice', label: 'Invoice Generator', icon: DollarSign, prompt: 'Generate an invoice for: ' },
      { id: 'salescopy', label: 'Sales Copy Generator', icon: FileText, prompt: 'Write a sales copy for: ' },
    ]
  },
  {
    id: 'social',
    label: 'Social Media AI',
    icon: Share2,
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    tools: [
      { id: 'tiktok', label: 'TikTok Content Ideas', icon: Music2, prompt: 'Generate TikTok content ideas for: ' },
      { id: 'instagram', label: 'Instagram Ideas', icon: Share2, prompt: 'Generate Instagram content ideas for: ' },
      { id: 'hashtag', label: 'Hashtag Generator', icon: Hash, prompt: 'Generate hashtags for: ' },
      { id: 'calendar', label: 'Content Calendar', icon: Calendar, prompt: 'Create a content calendar for: ' },
    ]
  },
  {
    id: 'voice',
    label: 'AI Voice Studio',
    icon: Mic,
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    tools: [
      { id: 'voiceover', label: 'AI Voiceover Script', icon: Mic, prompt: 'Write a voiceover script for: ' },
      { id: 'narration', label: 'Narration Generator', icon: FileText, prompt: 'Write a narration for: ' },
    ]
  },
  {
    id: 'video',
    label: 'AI Video Studio',
    icon: Video,
    color: 'from-red-500 to-rose-500',
    bg: 'bg-red-50',
    iconColor: 'text-red-600',
    tools: [
      { id: 'text2video', label: 'Video Script', icon: FileText, prompt: 'Write a video script for: ' },
      { id: 'tiktok-vid', label: 'TikTok Video Script', icon: Music2, prompt: 'Write a TikTok video script for: ' },
      { id: 'promo', label: 'Product Promo Script', icon: Package, prompt: 'Write a product promo script for: ' },
      { id: 'marketing-vid', label: 'Marketing Video Script', icon: Megaphone, prompt: 'Write a marketing video script for: ' },
    ]
  },
];

export default function AIHub() {
  const {} = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<any | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(10);

  const filteredModules = AI_MODULES.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.tools.some(t => t.label.toLowerCase().includes(search.toLowerCase()))
  );

  async function runTool() {
    if (!input.trim()) return;
    if (credits <= 0) { alert('No credits left. Please buy more credits.'); return; }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: activeTool.prompt + input }]
        })
      });
      const data = await res.json();
      const text = data.content?.map((c: any) => c.text || '').join('') || 'No result generated.';
      setResult(text);
      setCredits(c => c - 1);
    } catch {
      setResult('Error generating content. Please try again.');
    }
    setLoading(false);
  }

  const currentModule = AI_MODULES.find(m => m.id === activeModule);

  if (activeTool && currentModule) {
    const Icon = activeTool.icon;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => { setActiveTool(null); setResult(''); setInput(''); }} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentModule.color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{activeTool.label}</p>
            <p className="text-xs text-gray-400">{currentModule.label}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-600">{credits} credits</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="text-sm font-medium text-gray-700 mb-2 block">What do you want to create?</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`e.g. ${activeTool.id === 'logo' ? 'a tech startup called NovaPay' : activeTool.id === 'caption' ? 'a photo of my new product launch' : 'describe what you need...'}`}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 min-h-[100px]"
            />
            <button
              onClick={runTool}
              disabled={loading || !input.trim()}
              className={`w-full mt-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                loading || !input.trim()
                  ? 'bg-gray-100 text-gray-400'
                  : `bg-gradient-to-r ${currentModule.color} text-white shadow-sm hover:shadow-md`
              }`}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Wand2 className="w-4 h-4" /> Generate</>
              )}
            </button>
          </div>
          {result && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">Generated Result</p>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="text-xs text-blue-600 hover:underline"
                >Copy</button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeModule && currentModule) {
    const ModIcon = currentModule.icon;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveModule(null)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentModule.color} flex items-center justify-center`}>
            <ModIcon className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">{currentModule.label}</p>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {currentModule.tools.map(tool => {
            const ToolIcon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${currentModule.bg} flex items-center justify-center shrink-0`}>
                  <ToolIcon className={`w-5 h-5 ${currentModule.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{tool.label}</p>
                  <p className="text-xs text-gray-400">Tap to generate</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/10 rounded-xl">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold text-white">{credits} credits</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Hub</h1>
              <p className="text-xs text-blue-100">by PrimeConnect</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-6">Create content, grow faster with AI</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search AI tools..."
              className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl text-sm outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-8 space-y-4">
        {/* Credits Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">AI Credits Balance</p>
            <p className="text-2xl font-bold text-gray-800">{credits} <span className="text-sm font-normal text-gray-400">credits</span></p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1">
            <Plus className="w-3 h-3" /> Buy Credits
          </button>
        </div>

        {/* AI Modules */}
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">AI Studios</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredModules.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{module.label}</p>
                <p className="text-xs text-gray-400 mt-1">{module.tools.length} tools</p>
              </button>
            );
          })}
        </div>

        {/* Popular Tools */}
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Popular Tools</p>
        <div className="space-y-2">
          {[
            { label: 'Caption Generator', module: 'writing', tool: 'caption', color: 'from-blue-500 to-indigo-500' },
            { label: 'Logo Generator', module: 'image', tool: 'logo', color: 'from-pink-500 to-rose-500' },
            { label: 'Business Name Generator', module: 'business', tool: 'bizname', color: 'from-emerald-500 to-teal-500' },
            { label: 'Hashtag Generator', module: 'social', tool: 'hashtag', color: 'from-purple-500 to-violet-500' },
          ].map(item => (
            <button
              key={item.tool}
              onClick={() => {
                const mod = AI_MODULES.find(m => m.id === item.module);
                const tool = mod?.tools.find(t => t.id === item.tool);
                if (mod && tool) { setActiveModule(item.module); setActiveTool(tool); }
              }}
              className="w-full bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-800 flex-1 text-left">{item.label}</p>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
          <BottomNav />
    </div>
  );
}
