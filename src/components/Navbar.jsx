import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Settings, User, Menu, X, LogOut, Layers } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assumes React Router for navigation

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: 1, name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', label: 'Navigate to Dashboard' },
    { id: 2, name: 'Products', icon: Package, path: '/products', label: 'Navigate to Products' },
    { id: 3, name: 'Orders', icon: ShoppingCart, path: '/orders', label: 'Navigate to Orders' },
    { id: 4, name: 'Categories', icon: Layers, path: '/categories', label: 'Navigate to Categories' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className="bg-gradient-to-r from-rose-600 via-orange-500 to-yellow-500 shadow-md font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/admin"
              className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
              aria-label="Navigate to Admin Home"
            >
              <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />
              Party Supplies Admin
            </Link>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="text-white p-2 rounded-xl hover:bg-rose-700 transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold px-4 py-2 rounded-xl hover:bg-rose-700 transition-all transform hover:scale-105"
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  {item.name}
                </Link>
              );
            })}
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                aria-label={isProfileOpen ? 'Close profile menu' : 'Open profile menu'}
                aria-expanded={isProfileOpen}
                className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold px-4 py-2 rounded-xl hover:bg-rose-700 transition-all"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                Admin
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-rose-200 z-10">
                  <Link
                    to="/admin/logout"
                    className="flex items-center gap-2 px-4 py-3 text-gray-800 hover:bg-rose-100 transition-all"
                    aria-label="Log out"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4 bg-white rounded-xl shadow-lg border-2 border-rose-200">
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-gray-800 text-base font-semibold px-4 py-2 rounded-xl hover:bg-rose-100 transition-all"
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {/* Profile in Mobile Menu */}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center gap-2 text-gray-800 text-base font-semibold px-4 py-2 rounded-xl hover:bg-rose-100 transition-all">
                  <User className="w-5 h-5" />
                  Admin
                </div>
                <Link
                  to="/admin/logout"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-800 text-base font-semibold px-4 py-2 rounded-xl hover:bg-rose-100 transition-all"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}