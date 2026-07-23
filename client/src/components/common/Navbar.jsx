import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Top Navbar displaying brand logo, user profile details, role badge, and sign out button.
 * @param {Function} onToggleSidebar - Optional callback for mobile sidebar toggle
 */
const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-[var(--color-border)] glass sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-[var(--color-muted)] hover:text-white hover:bg-white/5"
            >
              ☰
            </button>
          )}

          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-gradient">
            <span className="text-xl">🛡️</span> Insurance Platform
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user.name}</div>
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                {user.role}
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="text-xs px-3.5 py-2 rounded-lg border border-[var(--color-border)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors text-[var(--color-muted)] font-medium flex items-center gap-1.5"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
