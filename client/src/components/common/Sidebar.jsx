import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Sidebar navigation displaying role-restricted navigation links.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['admin', 'agent', 'customer'] },
    { name: 'Customers', path: '/customers', icon: '👥', roles: ['admin', 'agent'] },
    { name: 'Policies', path: '/policies', icon: '📜', roles: ['admin', 'agent', 'customer'] },
    { name: 'Claims', path: '/claims', icon: '⚠️', roles: ['admin', 'agent', 'customer'] },
    { name: 'Payments', path: '/payments', icon: '💰', roles: ['admin', 'agent', 'customer'] },
    { name: 'Documents', path: '/documents', icon: '📄', roles: ['admin', 'agent', 'customer'] },
    { name: 'Reports', path: '/reports', icon: '📈', roles: ['admin'] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-muted)]">
            {role === 'customer' ? 'Customer Workspace' : `${role} Management`}
          </div>

          <nav className="space-y-1.5">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'text-[var(--color-muted)] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    )}
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="card p-3.5 flex items-center gap-3 bg-gradient-to-br from-white/5 to-white/[0.02] border-[var(--color-border)] relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-600/30 shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden text-xs">
            <div className="font-bold text-white truncate">{user?.name}</div>
            <div className="text-[var(--color-muted)] text-[11px] truncate">{user?.email}</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
