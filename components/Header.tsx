import React from 'react';
import { ViewState } from '../App';

interface HeaderProps {
  currentView?: ViewState;
  onNavigate?: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const isDashboard = currentView === 'dashboard';

  return (
    <header className="mb-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MedScan AI
            </h1>
            <p className="text-xs text-cyan-400 font-medium tracking-wide">
              RADIOLOGY & CLINICAL ASSISTANT
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-white/5">
           <button 
             onClick={() => onNavigate?.('dashboard')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'dashboard' 
                 ? 'bg-slate-700 text-white shadow-sm' 
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
             }`}
           >
             Home
           </button>
           <button 
             onClick={() => onNavigate?.('radiology')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'radiology' 
                 ? 'bg-cyan-900/50 text-cyan-400 shadow-sm border border-cyan-500/20' 
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
             }`}
           >
             Radiology
           </button>
           <button 
             onClick={() => onNavigate?.('chat')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 currentView === 'chat' 
                 ? 'bg-emerald-900/50 text-emerald-400 shadow-sm border border-emerald-500/20' 
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
             }`}
           >
             Chat Assistant
           </button>
        </nav>

        {/* Status */}
        <div className="hidden md:flex items-center space-x-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-mono">SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;