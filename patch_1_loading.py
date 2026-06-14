from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '''  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin block mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }'''

new = '''  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-64 bg-gray-900 shrink-0 min-h-screen p-4 gap-3">
          <div className="h-8 w-36 bg-gray-700 rounded-lg animate-pulse mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-800 rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
        {/* Main skeleton */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="h-16 bg-white rounded-2xl animate-pulse shadow-sm" />
          {/* Welcome */}
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          {/* Content rows */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Skeleton loader applied!")
else:
    print("ERROR: Pattern not found. Check spacing.")
