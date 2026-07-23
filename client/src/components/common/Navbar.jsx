import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Top Navbar displaying brand logo, user profile details, role badge, and sign out button.
 */
const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const roleColors = {
    admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    agent: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    customer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  const roleClass = roleColors[user?.role] || roleColors.customer;

  return (
    <header className="border-b border-[var(--color-border)] glass sticky top-0 z-40 bg-[#090a12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-colors"
            >
              ☰
            </button>
          )}

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              🛡️
            </div>
            <span className="font-extrabold text-lg text-gradient tracking-tight">
              Insurance Platform
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user.name}</div>
              <div className="mt-0.5">
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${roleClass}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="text-xs px-3.5 py-2 rounded-xl border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all font-semibold text-[var(--color-muted)] flex items-center gap-1.5 active:scale-95"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
