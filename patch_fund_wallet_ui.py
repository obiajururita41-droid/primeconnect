from pathlib import Path

file = Path("src/pages/Dashboard.tsx")
content = file.read_text()

old = '''                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-green-500 text-sm">✅</span>
                        <p className="text-xs text-green-700 leading-relaxed">No BVN required. Transfer and your wallet is funded instantly.</p>
                      </div>'''

new = '''                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-xs text-white font-semibold">No BVN required — transfer and your wallet is funded instantly.</p>
                      </div>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED")
    idx = content.find('No BVN required')
    if idx != -1:
        print(repr(content[idx-100:idx+200]))
