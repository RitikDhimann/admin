import React from 'react';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search for orders, products..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-900/10 transition-colors">
          <Bell size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Administrator</p>
            <p className="text-sm font-black text-slate-800">Admin User</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-pastel-pink flex items-center justify-center text-brand-brown shadow-lg shadow-pastel-pink/20 overflow-hidden group">
             <User size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button 
             className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
             title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
