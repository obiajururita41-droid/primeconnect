from pathlib import Path

file = Path("src/pages/About.tsx")
content = file.read_text()

old = """  const team = [
    { name: 'OBIAJURU RITA', role: 'Founder & CEO', initial: 'OR' },
    { name: 'Obiajuru Ifeanyi', role: 'Co-Founder', initial: 'OI' },
    { name: 'Obiajuru Chidera', role: 'Co-Founder', initial: 'OC' },
    { name: 'Egwu Lydia', role: 'Co-Founder', initial: 'EL' },
  ];"""

new = """  const team = [
    { name: 'Obiajuru Rita', role: 'Founder & CEO', initial: 'OR', desc: 'Visionary leader driving PrimeConnect\'s mission to simplify digital finance for every Nigerian.' },
    { name: 'Obiajuru Ifeanyi', role: 'Co-Founder & CTO', initial: 'OI', desc: 'Tech architect behind PrimeConnect\'s fast, secure, and scalable platform infrastructure.' },
  ];"""

if old in content:
    content = content.replace(old, new)
    print("Step 1 OK: team updated")
else:
    print("Step 1 FAILED")
    idx = content.find('const team')
    if idx != -1:
        print(repr(content[idx:idx+200]))

# Now improve the team card rendering
old2 = '''            {team.map((member) => ('''
# Find the full team map block
idx = content.find('            {team.map((member) => (')
if idx != -1:
    print("Found team map, checking render block...")

# Replace the whole team section render
old3 = content[content.find('{/* Team */'): content.find('{/* Team */') + 400]
print(repr(old3[:200]))

file.write_text(content)
print("Saved!")
