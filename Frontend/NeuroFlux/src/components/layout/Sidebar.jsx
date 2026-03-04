import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/profile', icon: User, text: 'Profile' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-slate-200/60 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Logo and Close Button */}
        <div className=''>
          <div className=''>
            <div className=''>
              <BrainCircuit size={20} strokeWidth={2.5} />
            </div>
            <h1 className=''>AI learning Assistant</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className='md:hidden absolute top-4 right-4 p-2 rounded-md text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500'
            aria-label='Close sidebar'
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className='mt-10 flex flex-col gap-2 px-4'>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${
                      isActive
                        ? 'group-hover:scale-110'
                        : 'group-hover:translate-x-1'
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className=''>
          <button
            onClick={handleLogout}
            className=''
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className=''
            />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;