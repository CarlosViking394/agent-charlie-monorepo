import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <Header />
      <main className="relative z-10">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;