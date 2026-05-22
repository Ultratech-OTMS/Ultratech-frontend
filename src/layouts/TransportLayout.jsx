import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiTruck, FiList, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { to: '/transport', label: 'Dashboard', icon: FiTruck, end: true },
  { to: '/transport/deliveries', label: 'My Deliveries', icon: FiList },
];

export default function TransportLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 flex flex-col z-30 transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <div>
            <div className="text-yellow-400 font-black text-xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              ULTRATECH
            </div>
            <div className="text-gray-400 text-xs uppercase tracking-widest">Transport Portal</div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400">
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all
                ${isActive ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-400 text-xs">Transport Staff</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-600">
            <FiMenu size={22} />
          </button>
          <h1 className="text-gray-800 font-semibold text-lg">Transport Dashboard</h1>
          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            Driver
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}