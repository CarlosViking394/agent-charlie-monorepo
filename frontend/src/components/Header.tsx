import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const AgentCharlieIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#0ea5e9', stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:'#d946ef', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#84cc16', stopOpacity:1}} />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="14" fill="url(#header-gradient)" opacity="0.1"/>
      <circle cx="16" cy="16" r="12" fill="url(#header-gradient)" opacity="0.2"/>

      <path d="M16 6 C22 6 26 10 26 16 C26 22 22 26 16 26" stroke="url(#header-gradient)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      <circle cx="8" cy="12" r="1.5" fill="url(#header-gradient)"/>
      <circle cx="8" cy="20" r="1.5" fill="url(#header-gradient)"/>
      <circle cx="16" cy="8" r="1.5" fill="url(#header-gradient)"/>

      <path d="M8 12 L16 8" stroke="url(#header-gradient)" strokeWidth="1" opacity="0.6"/>
      <path d="M8 20 L8 12" stroke="url(#header-gradient)" strokeWidth="1" opacity="0.6"/>
    </svg>
  );

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isHome ? 'glass-panel glass-panel--elevated border-b border-white/5' : 'glass-panel glass-panel--elevated border-b border-white/10'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform group">
            <AgentCharlieIcon />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-azure-700 via-orchid-600 to-lime-600 bg-clip-text text-transparent">
                Agent Charlie
              </h1>
              <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                Your calm, capable companion
              </p>
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
          <nav className="hidden md:flex items-center gap-1 mx-8">
            <Link
              to="/"
              className={`glass-pill transition-all ${isActive('/') ? 'glass-pill--active' : 'hover:glass-pill--active'}`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`glass-pill transition-all ${isActive('/search') ? 'glass-pill--active' : 'hover:glass-pill--active'}`}
            >
              Browse
            </Link>
            <Link
              to="/compare"
              className={`glass-pill transition-all ${isActive('/compare') ? 'glass-pill--active' : 'hover:glass-pill--active'}`}
            >
              Compare
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <button className="glass-button p-2 hover:scale-105 transition-transform relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-azure-500 to-orchid-500 rounded-full"></div>
            </button>

            <button className="glass-button p-2 hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-white/20 mx-2"></div>

            <button className="glass-button--primary px-4 py-2 font-semibold hover:scale-105 transition-transform">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            <button className="glass-button p-3 md:hidden hover:scale-105 transition-transform">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;