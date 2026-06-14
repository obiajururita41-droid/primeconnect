from pathlib import Path

file = Path("src/pages/About.tsx")
content = file.read_text()

old = 'Meet the Team</h2>\n          <div className="grid grid-cols-2 gap-4">\n            {team.map((member) => (\n              <div key={member.name} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">\n                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">\n                  {member.initial}\n                </div>\n                <div className="font-semibold text-gray-900 text-sm">{member.name}</div>\n                <div className="text-xs text-gray-500 mt-1">{member.role}</div>\n              </div>\n            ))}\n          </div>'

new = '''Meet the Team</h2>
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
          </div>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED")
