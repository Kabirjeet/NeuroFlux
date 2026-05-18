import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X, ClipboardList, Trophy } from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/quizzes', icon: ClipboardList, text: 'Quizzes' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggle}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-900/95 backdrop-blur-lg border-r border-dark-700/60 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >

        {/* Logo and Close Button */}
        <div className='flex items-center justify-between p-4 border-b border-dark-700/60'>
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/dashboard')}>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30'>
              <BrainCircuit size={20} strokeWidth={2.5} className='text-white' />
            </div>
            <h1 className='text-lg font-semibold text-dark-100'>NeuroFlux</h1>
          </div>
          <button
            onClick={toggle}
            className='md:hidden p-2 rounded-md text-dark-400 hover:text-dark-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500'
            aria-label='Close sidebar'
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className='mt-6 flex flex-col gap-1 px-3'>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggle();
                }
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={20}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${isActive
                        ? 'group-hover:scale-110'
                        : 'group-hover:translate-x-1'
                      }`}
                  />
                  <span className='font-medium'>{link.text}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className='absolute bottom-6 left-0 right-0 px-3'>
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200'
          >
            <LogOut
              size={20}
              strokeWidth={2}
            />
            <span className='font-medium'>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;

