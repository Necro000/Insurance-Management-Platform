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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            {role === 'customer' ? 'Customer Menu' : `${role} Menu`}
          </div>

          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-[var(--color-muted)] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="card p-3 flex items-center gap-3 bg-white/5 border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden text-xs">
            <div className="font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[var(--color-muted)] truncate">{user?.email}</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
