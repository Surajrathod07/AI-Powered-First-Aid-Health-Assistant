import React from 'react';
import { ViewState } from '../App';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
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
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Radiology & First-Aid
            </h3>
            
            <p className="text-slate-400 leading-relaxed mb-6">
              Detailed structured reports for X-rays, MRIs, and symptoms. Best for comprehensive documentation and triage.
            </p>

            <span className="inline-flex items-center text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
              Open Module
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
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
            
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
              Clinical Chat Assistant
            </h3>
            
            <p className="text-slate-400 leading-relaxed mb-6">
              Interactive conversational AI with voice support. Best for quick questions, follow-ups, and step-by-step guidance.
            </p>

            <span className="inline-flex items-center text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
              Start Chat
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
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