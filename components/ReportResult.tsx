import React from 'react';
import { PatientDetails } from '../types';

interface ReportResultProps {
  report: string;
  patientDetails: PatientDetails;
}

const ReportResult: React.FC<ReportResultProps> = ({ report, patientDetails }) => {
  const handleCopy = () => {
    // Construct the full text to copy including the summary
    const summaryText = `PATIENT SUMMARY: ${patientDetails.ageGroup} ${patientDetails.sex}, ${patientDetails.symptomType}, ${patientDetails.painSeverity} pain.\n\n`;
    navigator.clipboard.writeText(summaryText + report);
  };

  // Function to format the markdown-style text into simple HTML elements for display
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('## ') || line.startsWith('**Title') || line.startsWith('**Clinical')) {
        return <h3 key={index} className="text-xl font-bold text-cyan-300 mt-6 mb-3 border-b border-white/10 pb-2">{line.replace(/##|\*\*/g, '')}</h3>;
      }
      // Bold items
      if (line.startsWith('**') || line.startsWith('- **')) {
         const content = line.replace(/^- /, '').replace(/\*\*/g, '');
         const [title, ...rest] = content.split(':');
         return (
             <div key={index} className="mb-2 ml-4">
                 <span className="font-bold text-white">{title}:</span>
                 <span className="text-slate-300">{rest.join(':')}</span>
             </div>
         );
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return <li key={index} className="ml-6 text-slate-300 mb-1 list-disc pl-2">{line.replace(/^[-•] /, '')}</li>;
      }
      // Disclaimer styling
      if (line.toLowerCase().includes('disclaimer') || line.toLowerCase().includes('not a doctor')) {
          return <p key={index} className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm italic">{line}</p>;
      }
      // Standard paragraph
      if (line.trim() === '') return <br key={index}/>;
      
      return <p key={index} className="mb-2 text-slate-300 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[800px]">
      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analysis Report
        </h2>
        <button
          onClick={handleCopy}
          className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Copy Report
        </button>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar">
        {/* Patient Summary Block inside Report */}
        <div className="mb-6 p-3 bg-cyan-900/30 border-l-4 border-cyan-500 rounded-r-lg">
            <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">Patient Summary</h4>
            <p className="text-sm text-cyan-100">
                <span className="font-semibold">{patientDetails.ageGroup} • {patientDetails.sex}</span> <br/>
                {patientDetails.symptomType} • {patientDetails.painSeverity} pain • {patientDetails.duration}
            </p>
        </div>

        <div className="text-slate-200">
          {formatText(report)}
        </div>
      </div>
    </div>
  );
};

export default ReportResult;
