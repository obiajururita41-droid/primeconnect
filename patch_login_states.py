from pathlib import Path

file = Path("src/pages/Login.tsx")
content = file.read_text()

old = "  const [showPassword, setShowPassword] = useState(false);"
new = """  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);"""

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: States added!")
else:
    print("FAILED")
