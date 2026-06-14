from pathlib import Path

file = Path("src/pages/About.tsx")
content = file.read_text()

old = """  const team = [
    { name: 'Obiajuru Rita', role: 'Founder & CEO', initial: 'OR', desc: 'Visionary leader driving PrimeConnect's mission to simplify digital finance for every Nigerian.' },
    { name: 'Obiajuru Ifeanyi', role: 'Co-Founder & CTO', initial: 'OI', desc: 'Tech architect behind PrimeConnect's fast, secure, and scalable platform infrastructure.' },
  ];"""

new = """  const team = [
    { name: 'Obiajuru Rita', role: 'Founder & CEO', initial: 'OR', desc: 'Visionary leader driving PrimeConnect mission to simplify digital finance for every Nigerian.' },
    { name: 'Obiajuru Ifeanyi', role: 'Co-Founder & CTO', initial: 'OI', desc: 'Tech architect behind PrimeConnect fast, secure, and scalable platform infrastructure.' },
  ];"""

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED - trying direct fix")
    # Direct fix using replace on the problematic strings
    content = content.replace("PrimeConnect's mission", "PrimeConnect mission")
    content = content.replace("PrimeConnect's fast", "PrimeConnect fast")
    file.write_text(content)
    print("Fixed via direct replace!")
