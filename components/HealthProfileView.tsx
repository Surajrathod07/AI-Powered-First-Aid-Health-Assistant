
import React, { useState, useEffect } from 'react';
import { ViewState, UserHealthProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile, getUserProfile } from '../services/profileService';

interface HealthProfileViewProps {
  onNavigate: (view: ViewState) => void;
}

const CONDITIONS_LIST = [
  'Diabetes', 'Blood Pressure', 'Heart Condition', 'Asthma', 'Thyroid', 'None'
];

const AGE_GROUPS = [
  'Under 12', '13–18', '19–30', '31–45', '46–60', '60+'
];

const HealthProfileView: React.FC<HealthProfileViewProps> = ({ onNavigate }) => {
  const { isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profile, setProfile] = useState<UserHealthProfile>({
    full_name: '',
    age_group: '31–45',
    gender: 'Prefer not to say',
    conditions: [],
    allergies: '',
    medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    preferred_language: 'English'
  });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getUserProfile(isGuest);
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, [isGuest]);

  const handleConditionToggle = (condition: string) => {
    setProfile(prev => {
      const exists = prev.conditions.includes(condition);
      if (condition === 'None') {
        return { ...prev, conditions: ['None'] };
      }
      let newConditions = exists 
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions.filter(c => c !== 'None'), condition];
      
      return { ...prev, conditions: newConditions };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await saveUserProfile(profile, isGuest);

    if (result.success) {
      setMessage({ type: 'success', text: 'Health Profile saved successfully!' });
      // Update local state with new timestamp so UI reflects it immediately
      setProfile(prev => ({ ...prev, updated_at: new Date().toISOString() }));
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save profile' });
    }
    setSaving(false);
  };

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder-slate-500";
  const labelClass = "block text-sm font-medium text-cyan-400 mb-1.5";

  if (loading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
             <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                <span className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </span>
                My Health Profile
            </h2>
            <p className="text-slate-400">
                This information helps our AI provide safer, more personalized guidance.
            </p>
        </div>
        {profile.updated_at && (
            <span className="text-xs text-slate-500 italic mt-2 md:mt-0">
                Last updated: {new Date(profile.updated_at).toLocaleDateString()} {new Date(profile.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Basic Info */}
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2">Personal Details</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <input type="text" required value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className={inputClass} placeholder="Your Name" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Age Group</label>
                            <select value={profile.age_group} onChange={e => setProfile({...profile, age_group: e.target.value})} className={inputClass}>
                                {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className={inputClass}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Preferred Language</label>
                        <select value={profile.preferred_language} onChange={e => setProfile({...profile, preferred_language: e.target.value as any})} className={inputClass}>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2 text-red-300">Emergency Info</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Emergency Contact Name</label>
                        <input type="text" required value={profile.emergency_contact_name} onChange={e => setProfile({...profile, emergency_contact_name: e.target.value})} className={inputClass} placeholder="e.g. Spouse, Parent" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Contact Phone</label>
                            <input type="tel" required value={profile.emergency_contact_phone} onChange={e => setProfile({...profile, emergency_contact_phone: e.target.value})} className={inputClass} placeholder="+1..." />
                        </div>
                        <div>
                            <label className={labelClass}>Blood Group (Opt)</label>
                            <select value={profile.blood_group} onChange={e => setProfile({...profile, blood_group: e.target.value})} className={inputClass}>
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Medical History */}
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl h-full">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/5 pb-2 text-emerald-300">Medical History</h3>
                
                <div className="space-y-6">
                    
                    {/* Conditions */}
                    <div>
                        <label className={labelClass}>Existing Conditions</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {CONDITIONS_LIST.map(cond => (
                                <button
                                    key={cond}
                                    type="button"
                                    onClick={() => handleConditionToggle(cond)}
                                    className={`text-sm px-3 py-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                                        profile.conditions.includes(cond)
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                                        : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {cond}
                                    {profile.conditions.includes(cond) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className={labelClass}>Allergies</label>
                        <textarea 
                            value={profile.allergies} 
                            onChange={e => setProfile({...profile, allergies: e.target.value})} 
                            className={`${inputClass} h-20 resize-none`} 
                            placeholder="e.g. Penicillin, Peanuts, Dust..." 
                        />
                    </div>

                    {/* Medications */}
                    <div>
                        <label className={labelClass}>Current Medications</label>
                        <textarea 
                            value={profile.medications} 
                            onChange={e => setProfile({...profile, medications: e.target.value})} 
                            className={`${inputClass} h-20 resize-none`} 
                            placeholder="e.g. Metformin 500mg, Aspirin..." 
                        />
                    </div>

                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="md:col-span-2 flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 sticky bottom-4 z-10 backdrop-blur-md">
            
            <div className="flex-1">
                 {message && (
                     <span className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                         {message.text}
                     </span>
                 )}
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="px-6 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className={`px-8 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${
                        saving
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:-translate-y-0.5'
                    }`}
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default HealthProfileView;
