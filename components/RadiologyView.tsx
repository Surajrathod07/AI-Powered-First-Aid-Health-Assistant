
import React, { useState } from 'react';
import PatientForm from './PatientForm';
import ImageUpload from './ImageUpload';
import ReportResult from './ReportResult';
import { generateMedicalReport } from '../services/aiService';
import { 
  PatientDetails, 
  AgeGroup, 
  Sex, 
  SymptomType, 
  Duration, 
  PainSeverity, 
  ReportFocus,
  AnalysisRequest 
} from '../types';

const RadiologyView: React.FC = () => {
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    ageGroup: AgeGroup.ADULT,
    sex: Sex.MALE,
    symptomType: SymptomType.OTHER,
    duration: Duration.DAYS,
    painSeverity: PainSeverity.MILD,
    reportFocus: ReportFocus.COMBINED
  });

  const [clinicalContext, setClinicalContext] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePatientDetailChange = (field: keyof PatientDetails, value: string) => {
    setPatientDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setReport(null);
    setError(null);

    try {
      const request: AnalysisRequest = {
        patientDetails,
        clinicalContext,
        imageFile
      };

      const result = await generateMedicalReport(request);
      setReport(result);
      
      // Auto-scroll to result
      setTimeout(() => {
        document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <PatientForm 
            details={patientDetails}
            onChange={handlePatientDetailChange}
          />

          {/* Clinical Context Input */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Clinical Context
            </h2>
            <textarea
              className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder-slate-500 resize-none"
              placeholder="Describe symptoms, history, mechanism of injury, etc..."
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
            ></textarea>
          </div>

          <ImageUpload onImageSelected={setImageFile} />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${
              isAnalyzing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Generate Radiology Report'
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
              <span className="font-bold block mb-1">Error</span>
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          {report ? (
            <div id="report-section" className="animate-slideUp">
               <ReportResult report={report} patientDetails={patientDetails} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl min-h-[400px]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-lg font-medium">No report generated yet</p>
              <p className="text-sm">Fill in the details and click "Generate Radiology Report"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologyView;
