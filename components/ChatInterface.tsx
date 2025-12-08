
import React, { useState, useRef, useEffect } from 'react';
import { chatWithMedicalAI } from '../services/aiService';
import AudioControls from './AudioControls';
import { generatePDF } from '../services/pdfService';
import { ChatSession, ChatMessage, PatientDetails, AgeGroup, Sex, SymptomType, Duration, PainSeverity, ReportFocus, ViewState } from '../types';

interface ChatInterfaceProps {
    onNavigate?: (view: ViewState) => void;
    onSetSharedData?: (data: {summary?: string; patientName?: string}) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, onSetSharedData }) => {
  // Session State
  const [session, setSession] = useState<ChatSession>({
    id: Date.now().toString(),
    startTime: Date.now(),
    messages: [],
    patientSummary: {
      name: '',
      ageGroup: AgeGroup.ADULT,
      sex: Sex.MALE,
      symptomType: SymptomType.OTHER,
      duration: Duration.DAYS,
      painSeverity: PainSeverity.MILD,
      reportFocus: ReportFocus.LAYMAN
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  // Handle Input Send
  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachments: selectedImage ? [URL.createObjectURL(selectedImage)] : undefined
    };

    // Optimistic Update
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg]
    }));
    setInput('');
    const imageToSend = selectedImage; // capture for closure
    setSelectedImage(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      // Call AI Service
      const response = await chatWithMedicalAI(session, input, imageToSend);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.summary, // Main text to display
        timestamp: Date.now(),
        structuredResponse: response
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg]
      }));
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I apologize, but I encountered an error analyzing your request. Please try again.",
        timestamp: Date.now()
      };
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    await generatePDF(session);
  };

  const handleShare = () => {
      if (!onNavigate || !onSetSharedData) return;
      const lastMsg = session.messages.filter(m => m.role === 'model').pop();
      const summary = `Update on my health:\nI consulted the Clinical AI.\nSummary: "${lastMsg?.text || 'Checking symptoms'}"\n\nI will keep you posted.`;
      
      onSetSharedData({
          summary: summary,
          patientName: session.patientSummary.name
      });
      onNavigate('family-alert');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[85vh] gap-6 animate-fadeIn">
      
      {/* LEFT: Chat Area */}
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <div className="flex items-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                 <span className="text-emerald-100 font-medium">Clinical Assistant Online</span>
            </div>
            <div className="flex gap-2">
                <button onClick={handleShare} className="text-xs bg-pink-600 hover:bg-pink-500 text-white px-3 py-1 rounded transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Share
                </button>
                <button onClick={handleDownloadPDF} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors">
                    Save PDF
                </button>
            </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {session.messages.length === 0 && (
            <div className="text-center mt-20 opacity-50">
                <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                     </svg>
                </div>
                <p className="text-slate-300 text-lg">Hello! I'm your AI Clinical Assistant.</p>
                <p className="text-slate-500 text-sm mt-2">Describe symptoms or upload a photo to start.</p>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button onClick={() => setInput("I have a fever and headache.")} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 border border-white/10">Fever & Headache</button>
                    <button onClick={() => setInput("My child has a red rash on their arm.")} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 border border-white/10">Child Skin Rash</button>
                    <button onClick={() => setInput("Cut my finger, it's bleeding.")} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 border border-white/10">Bleeding Cut</button>
                </div>
            </div>
          )}

          {session.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-slate-700/50 text-slate-200 rounded-bl-none border border-white/5'
              }`}>
                {msg.attachments && msg.attachments.map((url, i) => (
                    <img key={i} src={url} alt="User attachment" className="mb-3 rounded-lg max-h-48 border border-white/10" />
                ))}
                
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.text}</p>
                
                {/* Structured Data Display for AI */}
                {msg.role === 'model' && msg.structuredResponse && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                        {/* Differentials */}
                        {msg.structuredResponse.differentialDiagnosis && (
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-2 tracking-wider">Potential Causes</p>
                                <ul className="space-y-2">
                                    {msg.structuredResponse.differentialDiagnosis.map((dx, idx) => (
                                        <li key={idx} className="bg-black/20 rounded p-2 text-sm border-l-2 border-emerald-500/50">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-emerald-200">{dx.condition}</span>
                                                <span className="text-xs text-slate-400">{dx.confidence}% Match</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{dx.reasoning}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Actions */}
                        {msg.structuredResponse.recommendedActions && (
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase mb-2 tracking-wider">Recommended Actions</p>
                                <ul className="list-disc ml-4 space-y-1">
                                    {msg.structuredResponse.recommendedActions.map((action, idx) => (
                                        <li key={idx} className="text-sm text-slate-300">{action}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                         {/* Meds */}
                         {msg.structuredResponse.suggestedMedications && msg.structuredResponse.suggestedMedications.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-purple-400 uppercase mb-2 tracking-wider">OTC Options</p>
                                <div className="flex flex-wrap gap-2">
                                    {msg.structuredResponse.suggestedMedications.map((med, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded border border-purple-500/30">
                                            {med}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {msg.role === 'model' && (
                        <AudioControls text={msg.text} />
                    )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-slate-700/50 text-slate-400 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2">
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800/50 border-t border-white/5 backdrop-blur-md">
            {imagePreview && (
                <div className="mb-2 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-emerald-500/50" />
                    <button onClick={() => {setImagePreview(null); setSelectedImage(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                
                <AudioControls 
                  isInput 
                  onTranscript={(text) => setInput(prev => prev + ' ' + text)} 
                />

                <button onClick={handleSend} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
      </div>

      {/* RIGHT: Context Panel (Hidden on mobile) */}
      <div className="hidden lg:flex w-80 flex-col gap-6">
        
        {/* Patient Summary Widget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Context</h3>
             <div className="space-y-3">
                 <div>
                     <label className="text-xs text-slate-500 block">Name</label>
                     <input 
                       type="text" 
                       value={session.patientSummary.name}
                       onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, name: e.target.value}}))}
                       className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                       placeholder="Optional"
                     />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="text-xs text-slate-500 block">Age</label>
                        <select 
                            value={session.patientSummary.ageGroup}
                            onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, ageGroup: e.target.value as AgeGroup}}))}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                        >
                            {Object.values(AgeGroup).map(g => <option key={g} value={g}>{g.split(' ')[0]}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 block">Sex</label>
                        <select 
                             value={session.patientSummary.sex}
                             onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, sex: e.target.value as Sex}}))}
                             className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                     </div>
                 </div>
             </div>
        </div>

        {/* Safety & Audit Widget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex-1">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Safety & Audit</h3>
             <div className="space-y-4">
                 <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                     <div className="flex items-center text-yellow-400 mb-1">
                         <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                         <span className="text-xs font-bold">Disclaimer</span>
                     </div>
                     <p className="text-[10px] text-yellow-200/80 leading-tight">
                         AI responses are for informational purposes only and do not replace professional medical advice. Call emergency services for critical conditions.
                     </p>
                 </div>

                 <div className="text-xs text-slate-500">
                     <p>Model: Gemini 2.5 Flash</p>
                     <p>Session ID: {session.id.slice(-6)}</p>
                     <p>Encryption: TLS 1.3</p>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;
