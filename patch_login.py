from pathlib import Path

file = Path("src/pages/Login.tsx")
content = file.read_text()

old = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';"""

new = """import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';"""

if old in content:
    content = content.replace(old, new)
    print("Step 1 OK")
else:
    print("Step 1 FAILED")

old2 = "  const [isLoading, setIsLoading] = useState(false);"
new2 = """  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);"""

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 2 OK")
else:
    print("Step 2 FAILED")

old3 = """              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />"""

new3 = """              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>"""

if old3 in content:
    content = content.replace(old3, new3)
    file.write_text(content)
    print("Step 3 OK: Eye toggle added!")
else:
    print("Step 3 FAILED")
    idx = content.find('name="password"')
    if idx != -1:
        print(repr(content[idx:idx+200]))
