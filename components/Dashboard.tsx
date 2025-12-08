
import React from 'react';
// Fix: Import ViewState from types instead of App
import { ViewState } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Select Assistance Module
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Choose the AI tool best suited for your current needs.
          <br />
          <span className="text-sm text-slate-500">Secure, private, and powered by multimodal AI.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4">
        {/* Radiology Card */}
        <div 
          onClick={() => onNavigate('radiology')}
          className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Radiology & First-Aid
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Detailed structured reports for X-rays, MRIs, and symptoms.
            </p>

            <span className="inline-flex items-center text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Open Module
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Clinical Chat Card */}
        <div 
          onClick={() => onNavigate('chat')}
          className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
              Clinical Chat Assistant
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Interactive conversational AI with voice support for quick questions.
            </p>

            <span className="inline-flex items-center text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Start Chat
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Nearby Care Finder Card */}
        <div 
          onClick={() => onNavigate('care-finder')}
          className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-red-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors">
              Nearby Care Finder
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Find hospitals & pharmacies near your live location instantly.
            </p>

            <span className="inline-flex items-center text-red-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Find Care
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Family Alert Card (NEW) */}
        <div 
          onClick={() => onNavigate('family-alert')}
          className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-pink-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">
              Family Alert
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Notify loved ones about your health status via WhatsApp/SMS.
            </p>

            <span className="inline-flex items-center text-pink-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Open Family Alert
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
