
import React, { useState } from 'react';
import { ReportPayload } from '../types';
import { generateReportPdf, downloadReportJson } from '../services/pdfService';

interface ReportResultProps {
  report: ReportPayload;
}

const ReportResult: React.FC<ReportResultProps> = ({ report }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadMsg(null);
    try {
        await generateReportPdf(report);
        downloadReportJson(report);
        setDownloadMsg("Report downloaded successfully");
        setTimeout(() => setDownloadMsg(null), 3000);
    } catch (e) {
        console.error(e);
        setDownloadMsg("Failed to generate download");
    } finally {
        setDownloading(false);
    }
  };

  const isEmergency = report.riskLevel === 'emergency';

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[800px]">
      
      {/* Header */}
      <div className={`p-4 border-b border-white/10 flex justify-between items-center sticky top-0 backdrop-blur-md z-10 ${
          isEmergency ? 'bg-red-900/40' : 'bg-white/5'
      }`}>
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-2 ${isEmergency ? 'text-red-400' : 'text-emerald-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Medical Summary
        </h2>
        
        <div className="flex items-center gap-2">
            {downloadMsg && <span className="text-xs text-emerald-400 mr-2">{downloadMsg}</span>}
            <button
            onClick={handleDownload}
            disabled={downloading}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg ${
                downloading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
            }`}
            >
            {downloading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                </span>
            ) : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Download Report
                </>
            )}
            </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar text-slate-200 space-y-8">
        
        {/* Risk Banner */}
        {isEmergency && (
             <div className="bg-red-600 text-white font-bold p-4 rounded-xl text-center shadow-lg border-2 border-red-400 animate-pulse">
                 ⚠️ SUGGESTION: SEEK PROFESSIONAL MEDICAL CARE
             </div>
        )}

        {/* 2. Reported Symptoms */}
        <section>
            <h3 className="text-lg font-bold text-cyan-400 mb-2 border-b border-white/10 pb-1">Reported Symptoms</h3>
            <p className="leading-relaxed text-slate-300">{report.clinicalSummary}</p>
        </section>

        {/* 3. Possible Causes */}
        <section>
            <h3 className="text-lg font-bold text-cyan-400 mb-2 border-b border-white/10 pb-1">Possible Causes</h3>
            <ul className="space-y-2">
                {report.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <span className="font-semibold">{cause.name}</span>
                        {cause.confidence && <span className="text-xs bg-cyan-900/50 px-2 py-1 rounded text-cyan-200">{cause.confidence}</span>}
                    </li>
                ))}
            </ul>
        </section>

        {/* 4. Suggested Medicines */}
        {!isEmergency && (
            <section>
                <h3 className="text-lg font-bold text-emerald-400 mb-2 border-b border-white/10 pb-1">Suggested Medicines (OTC)</h3>
                
                {report.suggestedMedicines && report.suggestedMedicines.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {report.suggestedMedicines.map((med, idx) => (
                            <div key={idx} className="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-emerald-300">{med.name}</h4>
                                    <span className="text-xs uppercase bg-emerald-900/50 px-2 py-1 rounded text-emerald-400">{med.form}</span>
                                </div>
                                <div className="text-sm space-y-1 text-slate-300">
                                    <p><span className="text-slate-500">Dose:</span> {med.dose} ({med.strength})</p>
                                    <p><span className="text-slate-500">Timing:</span> {med.timing}</p>
                                </div>
                                {med.notes && <p className="italic text-xs mt-2 text-slate-400">{med.notes}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 italic">No specific medicines suggested.</p>
                )}
            </section>
        )}

        {/* 5. Home Care */}
        <section>
            <h3 className="text-lg font-bold text-blue-400 mb-2 border-b border-white/10 pb-1">Home Care Advice</h3>
            <ul className="space-y-2">
                {report.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{action}</span>
                    </li>
                ))}
            </ul>
        </section>

        {/* 6. When to See a Doctor */}
        <section>
            <h3 className="text-lg font-bold text-red-400 mb-2 border-b border-white/10 pb-1">When to See a Doctor</h3>
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                <ul className="space-y-2">
                    {report.redFlags?.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-red-200">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{flag}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
        
        <div className="text-xs text-slate-500 text-center pt-4 italic">
             {report.disclaimer || "Disclaimer: Informational purposes only. Not medical advice."}
        </div>

      </div>
    </div>
  );
};

export default ReportResult;
