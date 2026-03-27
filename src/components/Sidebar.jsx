import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Layers, 
  PlusSquare, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Ticket,
  X,
  LogOut,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile, onClose }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Events', icon: Calendar, path: '/events' },
    { name: 'Categories', icon: Layers, path: '/categories' },
    { name: 'Add Product', icon: PlusSquare, path: '/add-product' },
    { name: 'Coupons', icon: Ticket, path: '/coupons' },
    { name: 'Queries', icon: MessageSquare, path: '/queries' },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobile ? 'border-r-0' : ''}`}
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
            <Sparkles size={24} />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="font-heading font-black text-slate-800 text-lg tracking-tight">
              PROPZ<span className="text-brand-primary">ADMIN</span>
            </span>
          )}
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-slate-900/10 text-slate-900 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }
            `}
          >
            <item.icon size={22} className={`transition-transform duration-200 group-hover:scale-110`} />
            {(!isCollapsed || isMobile) && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 w-full text-red-500 hover:bg-red-50 hover:font-bold`}
        >
          <LogOut size={22} className="flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="text-sm">Log Out</span>}
        </button>

        {/* Collapse Toggle - Only for Desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
