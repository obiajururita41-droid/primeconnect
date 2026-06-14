from pathlib import Path

file = Path("src/pages/Dashboard.tsx")
content = file.read_text()

# Find and replace using exact content from repr
old = '                    <>\n                      {/* BVN form */}\n                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex items-start gap-2">\n                        <span className="text-amber-500 text-sm mt-0.5">🔐</span>\n                        <p className="text-xs text-amber-700 leading-relaxed">To get a dedicated bank account, we need to verify your identity with your BVN. Your BVN is never stored or shared.</p>\n                      </div>'

idx = content.find(old[:80])
if idx != -1:
    print("Found at index:", idx)
    print(repr(content[idx:idx+1500]))
else:
    print("Not found, searching differently...")
    idx2 = content.find('BVN form')
    print(repr(content[idx2-100:idx2+1500]))
