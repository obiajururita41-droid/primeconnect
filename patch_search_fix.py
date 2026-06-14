with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = "        {(tab === 'transactions' || tab === 'users') && ("
new = "        {tab === 'users' && ("

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Fixed duplicate search!')
else:
    print('ERROR: Block not found.')
