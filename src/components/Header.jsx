import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Menu, ShoppingCart, MessageSquare, CreditCard } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onMenuClick }) => {
  const [notifications, setNotifications] = useState({ newQueries: 0, processingOrders: 0, unpaidOrders: 0, total: 0 });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/order/notifications`);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 60 seconds
    return () => clearInterval(interval);
  }, []);

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
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              showDropdown ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-900/10'
            }`}
          >
            <Bell size={20} />
            {notifications.total > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {notifications.total}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-6 bg-slate-900 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold">
                        {notifications.total} NEW
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    {notifications.total === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">All caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.processingOrders > 0 && (
                          <Link 
                            to="/orders" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                              <ShoppingCart size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{notifications.processingOrders} New Orders</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requires processing</p>
                            </div>
                          </Link>
                        )}

                        {notifications.newQueries > 0 && (
                          <Link 
                            to="/queries" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                              <MessageSquare size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{notifications.newQueries} New Queries</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting response</p>
                            </div>
                          </Link>
                        )}

                        {notifications.unpaidOrders > 0 && (
                          <Link 
                            to="/orders" 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{notifications.unpaidOrders} Unpaid Orders</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check payment status</p>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {notifications.total > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                       <button className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">
                         Mark all as seen
                       </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
