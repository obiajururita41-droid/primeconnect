from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '        {/* Welcome */}\n        <div className="mb-6">\n             <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 ro'

# Find full extent of the broken section
idx = content.find(old[:50])
if idx == -1:
    print("Not found")
else:
    # Replace just the double-opening divs
    broken = '        {/* Welcome */}\n        <div className="mb-6">\n             <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">'
    fixed  = '        {/* Welcome */}\n        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">'
    if broken in content:
        content = content.replace(broken, fixed)
        file.write_text(content)
        print("SUCCESS: Fixed!")
    else:
        print("ERROR: Showing more context...")
        print(repr(content[idx:idx+300]))
