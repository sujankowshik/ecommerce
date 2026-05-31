import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  FolderOpen,
  ShoppingBag,
  Users,
  TicketPercent,
  ArrowLeft
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { name: 'Analytics Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/admin/products', icon: Box },
    { name: 'Categories List', path: '/admin/categories', icon: FolderOpen },
    { name: 'Orders Listing', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers Base', path: '/admin/customers', icon: Users },
    { name: 'Coupons Panel', path: '/admin/coupons', icon: TicketPercent },
  ];

  const activeClass = 'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold bg-primary-600 text-white shadow-md shadow-primary-500/10 transition-all';
  const inactiveClass = 'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-200 transition-all';

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 p-6 flex flex-col space-y-8 select-none">
      
      {/* Brand Back anchor */}
      <div>
        <NavLink
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-primary-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </NavLink>
        <div className="mt-4 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">System Management</span>
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white font-display mt-0.5">Control Panel</h2>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 flex flex-col space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Signature Badge */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-mono">
        👤 Role: System Admin <br />
        🌐 Version: 1.0.0 (Production)
      </div>

    </aside>
  );
};

export default AdminSidebar;
