with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "trend: None, sub: 'Awaiting review'",
    "trend: null, sub: 'Awaiting review'"
)
content = content.replace(
    "trend: None, sub: 'Transactions today'",
    "trend: null, sub: 'Transactions today'"
)

with open('src/pages/AdminDashboard.tsx', 'w') as f:
    f.write(content)

print('SUCCESS: Fixed null values!')
