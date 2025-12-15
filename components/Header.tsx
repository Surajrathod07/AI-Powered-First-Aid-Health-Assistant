
import React from 'react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView?: ViewState;
  onNavigate?: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, isGuest, signOut, exitGuestMode } = useAuth();
  const isAuthenticated = !!user || isGuest;

  const navClass = (view: ViewState, activeColor: string, activeBg: string) => 
    `px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
        currentView === view 
        ? `${activeBg} ${activeColor} shadow-sm border border-current/20` 
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
    }`;

  const handleLogout = async () => {
      if (isGuest) {
          exitGuestMode();
      } else {
          await signOut();
      }
      onNavigate?.('landing');
  };

  return (
    <header className="mb-8 animate-fadeIn">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate?.(isAuthenticated ? 'dashboard' : 'landing')}>
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MedScan AI
            </h1>
            <p className="text-[10px] text-cyan-400 font-medium tracking-wide">
              RADIOLOGY • CHAT • CARE FINDER
            </p>
          </div>
        </div>

        {/* Navigation - Only Visible if Authenticated/Guest */}
        {isAuthenticated && (
            <nav className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar order-3 md:order-2 w-full md:w-auto justify-center">
            <button 
                onClick={() => onNavigate?.('dashboard')}
                className={navClass('dashboard', 'text-white', 'bg-slate-700')}
            >
                Home
            </button>
            <button 
                onClick={() => onNavigate?.('radiology')}
                className={navClass('radiology', 'text-cyan-400', 'bg-cyan-900/50')}
            >
                Radiology
            </button>
            <button 
                onClick={() => onNavigate?.('chat')}
                className={navClass('chat', 'text-emerald-400', 'bg-emerald-900/50')}
            >
                Chat Bot
            </button>
            <button 
                onClick={() => onNavigate?.('care-finder')}
                className={navClass('care-finder', 'text-red-400', 'bg-red-900/50')}
            >
                Find Care
            </button>
            <button 
                onClick={() => onNavigate?.('family-alert')}
                className={navClass('family-alert', 'text-pink-400', 'bg-pink-900/50')}
            >
                Family Alert
            </button>
            <button 
                onClick={() => onNavigate?.('health-profile')}
                className={navClass('health-profile', 'text-blue-400', 'bg-blue-900/50')}
            >
                My Profile
            </button>
            </nav>
        )}

        {/* Auth / Status Area */}
        <div className="flex items-center gap-3 order-2 md:order-3 ml-auto md:ml-0">
            {isAuthenticated ? (
                <>
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-xs text-white font-medium">
                            {user?.email?.split('@')[0] || (isGuest ? 'Guest User' : 'User')}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ONLINE
                        </span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-300 text-xs font-medium rounded-lg border border-white/10 transition-colors"
                    >
                        {isGuest ? 'Exit Demo' : 'Log Out'}
                    </button>
                </>
            ) : (
                <div className="flex gap-2">
                     <button 
                        onClick={() => onNavigate?.('auth-login')}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
                     >
                        Log In
                     </button>
                     <button 
                        onClick={() => onNavigate?.('auth-signup')}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all"
                     >
                        Sign Up
                     </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
