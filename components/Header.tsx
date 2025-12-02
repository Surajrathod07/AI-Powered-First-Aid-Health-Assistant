import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-10 text-center">
      <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-900/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
          MedScan AI
        </h1>
      </div>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Advanced AI-powered radiology assistant and symptom analyzer.
        <br />
        <span className="text-sm text-slate-500">Upload medical imaging or describe symptoms for a structured clinical report.</span>
      </p>
    </header>
  );
};

export default Header;
