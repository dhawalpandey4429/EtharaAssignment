import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
  ];

  return (
    <div className="flex h-screen bg-brand-bg text-text-primary font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-dark flex flex-col bg-sidebar-bg">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">C</div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            CollabTask
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-text-muted px-3 mb-2 font-black">Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                location.pathname === item.path 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                location.pathname === item.path ? "text-indigo-400" : "text-text-muted group-hover:text-white"
              )} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border-dark">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border-dark px-8 flex items-center justify-between bg-header-bg/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
              Projects <span className="text-border-dark">/</span> <span className="text-white">{navItems.find(i => i.path === location.pathname)?.name || 'Details'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-text-muted hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-header-bg"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border-dark">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{profile?.displayName}</p>
                <p className="text-xs text-text-muted">Admin</p>
              </div>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
