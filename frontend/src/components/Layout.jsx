import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Layout({ children, logout, user }) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/projects', label: '📋 Projects', icon: '📋' },
    { path: '/ai-guard', label: '🤖 AI Guard', icon: '🤖' },
    { path: '/schedule', label: '📅 Schedule', icon: '📅' },
    { path: '/portfolio', label: '📝 Portfolio', icon: '📝' },
    { path: '/weekly-report', label: '📬 Coach', icon: '📬' },
    { path: '/settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">🎼 The Orchestrator</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-1">Welcome, {user.name}</p>
          )}
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;