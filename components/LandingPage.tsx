
import React from 'react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
  onStartGuest: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onStartGuest }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-fadeIn px-4">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="inline-block mb-4 p-2 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
           <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-cyan-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
           </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          MedScan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Your Intelligent First Aid & Health Assistant. <br/>
          <span className="text-slate-400 text-lg">Radiology Analysis • Clinical Chat • Nearby Care • Family Alerts</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('auth-login')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/40 transition-all transform hover:-translate-y-1"
          >
            Get Started
          </button>
          
          <button 
            onClick={onStartGuest}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold text-lg backdrop-blur-md transition-all transform hover:-translate-y-1"
          >
            Try Demo
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {[
          { title: "Radiology Assistant", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", desc: "Upload X-rays & get structured reports instantly." },
          { title: "Clinical Chat", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", desc: "Voice-enabled medical Q&A with trusted guidance." },
          { title: "Nearby Care", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z", desc: "Find open hospitals & pharmacies near you." },
          { title: "Family Alert", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", desc: "Notify loved ones about your status in one click." }
        ].map((feature, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 mb-4 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
            </svg>
            <h3 className="text-white font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      <p className="mt-12 text-slate-500 text-xs">
        Disclaimer: This is an AI assistant for educational purposes. Always seek professional medical advice for emergencies.
      </p>
    </div>
  );
};

export default LandingPage;
