import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-transparent' : 'glass-panel'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 glass-panel glass-panel--specular rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 gradient-azure-orchid rounded-lg"></div>
            </div>
            <div className="font-bold text-xl text-primary group-hover:text-primary-hover transition-colors">
              Agent Charlie
            </div>
          </Link>

          {/* Search Bar - Only show on non-home pages */}
          {!isHome && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  className="glass-input pl-12 py-3"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <button className="glass-button p-3 hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </button>
            <button className="glass-button p-3 hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </button>
            <button className="glass-button p-3 md:hidden hover:scale-105 transition-transform">
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;