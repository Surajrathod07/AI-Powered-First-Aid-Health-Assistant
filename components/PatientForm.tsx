import React from 'react';
import { PatientDetails, AgeGroup, Sex, SymptomType, Duration, PainSeverity, ReportFocus } from '../types';

interface PatientFormProps {
  details: PatientDetails;
  onChange: (field: keyof PatientDetails, value: string) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ details, onChange }) => {
  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder-slate-500";
  const labelClass = "block text-sm font-medium text-cyan-400 mb-1.5";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl mb-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-cyan-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        Patient Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Name */}
        <div>
          <label className={labelClass}>Patient Name (Optional)</label>
          <input
            type="text"
            value={details.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g., John Doe"
            className={inputClass}
          />
        </div>

        {/* Age Group */}
        <div>
          <label className={labelClass}>Age Group</label>
          <select
            value={details.ageGroup}
            onChange={(e) => onChange('ageGroup', e.target.value)}
            className={inputClass}
          >
            {Object.values(AgeGroup).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Sex */}
        <div>
          <label className={labelClass}>Sex</label>
          <select
            value={details.sex}
            onChange={(e) => onChange('sex', e.target.value)}
            className={inputClass}
          >
            {Object.values(Sex).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Symptom Type */}
        <div>
          <label className={labelClass}>Primary Symptom Type</label>
          <select
            value={details.symptomType}
            onChange={(e) => onChange('symptomType', e.target.value)}
            className={inputClass}
          >
            {Object.values(SymptomType).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className={labelClass}>Duration of Symptoms</label>
          <select
            value={details.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            className={inputClass}
          >
            {Object.values(Duration).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Pain Severity */}
        <div>
          <label className={labelClass}>Pain Severity</label>
          <select
            value={details.painSeverity}
            onChange={(e) => onChange('painSeverity', e.target.value)}
            className={inputClass}
          >
            {Object.values(PainSeverity).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Report Focus - Spans full width on mobile, 2 cols on lg */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className={labelClass}>Preferred AI Response Focus</label>
          <select
            value={details.reportFocus}
            onChange={(e) => onChange('reportFocus', e.target.value)}
            className={inputClass}
          >
            {Object.values(ReportFocus).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
