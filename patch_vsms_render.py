from pathlib import Path

file = Path("src/pages/services/VirtualSMSPage.tsx")
content = file.read_text()

old = '                    <span className="text-xl mb-1">{s.icon}</span>'
new = '                    <div className="mb-1 flex items-center justify-center">{s.logo}</div>'

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED")
    idx = content.find('icon')
    if idx != -1:
        print(repr(content[idx-50:idx+50]))
