from pathlib import Path

file = Path("src/pages/Login.tsx")
content = file.read_text()

old = "import { Eye, EyeOff } from 'lucide-react';"
new = "import { Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';"

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED")
