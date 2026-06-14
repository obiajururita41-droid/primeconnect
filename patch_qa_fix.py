with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-gray-200/50 group-hover:scale-110 transition-transform duration-300"',
    'className="absolute -right-4 -bottom-4 w-14 h-14 rounded-full bg-gray-200/30 group-hover:scale-110 transition-transform duration-300"'
)

with open('src/pages/AdminDashboard.tsx', 'w') as f:
    f.write(content)
print('SUCCESS: Fixed!')
