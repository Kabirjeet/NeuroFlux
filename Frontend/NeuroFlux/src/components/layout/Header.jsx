import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    return
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between h-full px-6">
            {/*Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                aria-label='Toggle sidebar'
            >
                <Menu size={24} />
            </button>
            <div className='hidden md:block'></div>
            <div className="flex items-center gap-3">
                <button className="relative p-2 inline-flex items-center justify-center text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
                    <Bell size={20} strokeWidth={2} className='group-hover:scale-110 transition-transform duration-200' />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                </button>
                {/*User Profile Dropdown  */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200/60">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors duration-200">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                            <User size={20} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                            <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
}

export default Header