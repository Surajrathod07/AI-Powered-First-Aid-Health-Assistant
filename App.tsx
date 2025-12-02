import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import PatientForm from './components/PatientForm';
import ImageUpload from './components/ImageUpload';
import ReportResult from './components/ReportResult';
import { generateMedicalReport } from './services/aiService';
import { PatientDetails, AgeGroup, Sex, SymptomType, Duration, PainSeverity, ReportFocus } from './types';

const App: React.FC = () => {
  // State
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    ageGroup: AgeGroup.ADULT,
    sex: Sex.MALE,
    symptomType: SymptomType.EXTERNAL,
    duration: Duration.DAYS,
    painSeverity: PainSeverity.MODERATE,
    reportFocus: ReportFocus.COMBINED
  });
  
  const [clinicalContext, setClinicalContext] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleDetailChange = (field: keyof PatientDetails, value: string) => {
    setPatientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    // Basic validation
    if (!clinicalContext.trim() && !imageFile) {
        setError("Please provide either clinical context text or upload an image.");
        return;
    }

    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      const result = await generateMedicalReport({
        patientDetails,
        clinicalContext,
        imageFile
      });
      
      setReport(result);
      
      // Scroll to report after a short delay to allow rendering
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <Header />
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          <PatientForm details={patientDetails} onChange={handleDetailChange} />

          {/* Clinical Context Free Text */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Clinical Context & History
            </h2>
            <textarea
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
              placeholder="Describe symptoms, history of injury, current medications, or specific questions for the AI..."
              className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none transition-all"
            />
          </div>

          <ImageUpload onImageSelected={setImageFile} />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center
              ${isAnalyzing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/50 hover:shadow-cyan-900/70'
              }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Clinical Data...
              </>
            ) : (
              'Generate Clinical Report'
            )}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 relative" ref={reportRef}>
          {report ? (
             <ReportResult report={report} patientDetails={patientDetails} />
          ) : (
            <div className="h-full min-h-[400px] border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500 p-8 text-center border-dashed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-lg font-medium">No report generated yet</p>
              <p className="text-sm">Fill in the patient details and click "Generate Clinical Report" to see the AI analysis here.</p>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default App;
