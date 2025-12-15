
import React, { useState, useRef, useEffect } from 'react';
import { chatWithMedicalAI } from '../services/aiService';
import AudioControls from './AudioControls';
import { generatePDF } from '../services/pdfService';
import { ChatSession, ChatMessage, ViewState, Sex } from '../types';
import { saveSession, getAllSessions, deleteSession, createNewSession, getLastActiveOrNewSession } from '../services/chatStorage';

interface ChatInterfaceProps {
    onNavigate?: (view: ViewState) => void;
    onSetSharedData?: (data: {summary?: string; patientName?: string}) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, onSetSharedData }) => {
  // --- STATE ---
  const [session, setSession] = useState<ChatSession>(getLastActiveOrNewSession());
  const [historyList, setHistoryList] = useState<ChatSession[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---

  // Load history list on mount
  useEffect(() => {
    refreshHistory();
  }, []);

  // Save session whenever it changes (deep watch)
  useEffect(() => {
    if (session.messages.length > 0 || session.title !== 'New Consultation') {
        saveSession(session);
        refreshHistory();
    }
  }, [session]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  const refreshHistory = () => {
      setHistoryList(getAllSessions());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- ACTIONS ---

  const handleNewChat = () => {
      const newSess = createNewSession();
      setSession(newSess);
  };

  const handleSelectSession = (id: string) => {
      const found = historyList.find(s => s.id === id);
      if (found) {
          setSession(found);
      }
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteSession(id);
      refreshHistory();
      // If we deleted the active one, start new
      if (session.id === id) {
          handleNewChat();
      }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const currentTimestamp = Date.now();

    // Determine Title if it's the first user message
    let updatedTitle = session.title;
    if (session.messages.length === 0) {
        updatedTitle = input.trim().substring(0, 30) + (input.length > 30 ? '...' : '');
    }

    const userMsg: ChatMessage = {
      id: currentTimestamp.toString(),
      role: 'user',
      text: input,
      timestamp: currentTimestamp,
      attachments: selectedImage ? [URL.createObjectURL(selectedImage)] : undefined
    };

    // Optimistic Update
    const updatedSession = {
        ...session,
        title: updatedTitle,
        lastUpdated: currentTimestamp,
        messages: [...session.messages, userMsg]
    };
    
    setSession(updatedSession);
    setInput('');
    const imageToSend = selectedImage; 
    setSelectedImage(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      // Call AI Service
      const response = await chatWithMedicalAI(updatedSession, input, imageToSend);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.summary, 
        timestamp: Date.now(),
        structuredResponse: response
      };

      setSession(prev => ({
        ...prev,
        lastUpdated: Date.now(),
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

  // Helper to group history by date (Today, Yesterday, Previous)
  const getGroupedHistory = () => {
      const groups: Record<string, ChatSession[]> = { 'Today': [], 'Yesterday': [], 'Previous 30 Days': [] };
      const now = new Date();
      
      historyList.forEach(s => {
          const d = new Date(s.lastUpdated);
          const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === 0) groups['Today'].push(s);
          else if (diffDays === 1) groups['Yesterday'].push(s);
          else groups['Previous 30 Days'].push(s);
      });
      return groups;
  };

  const groupedHistory = getGroupedHistory();

  return (
    <div className="flex flex-col lg:flex-row h-[85vh] gap-4 animate-fadeIn">
      
      {/* 1. LEFT SIDEBAR: History (Hidden on mobile for now, or toggleable) */}
      <div className="hidden md:flex w-64 flex-col bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5">
              <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/20"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Chat
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
              {Object.entries(groupedHistory).map(([label, sessions]) => (
                  sessions.length > 0 && (
                      <div key={label}>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{label}</h4>
                          <div className="space-y-1">
                              {sessions.map(s => (
                                  <div 
                                    key={s.id}
                                    onClick={() => handleSelectSession(s.id)}
                                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                        session.id === s.id 
                                        ? 'bg-white/10 text-white shadow-inner' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                                  >
                                      <div className="flex-1 min-w-0">
                                          <p className="truncate text-sm font-medium">{s.title || 'New Chat'}</p>
                                          <p className="text-[10px] opacity-60 truncate">
                                              {new Date(s.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </p>
                                      </div>
                                      {session.id === s.id && (
                                          <button 
                                              onClick={(e) => handleDeleteSession(e, s.id)}
                                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                              title="Delete Chat"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                              </svg>
                                          </button>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )
              ))}
              {historyList.length === 0 && (
                  <div className="text-center py-10 opacity-30">
                      <p className="text-sm">No history yet</p>
                  </div>
              )}
          </div>
      </div>

      {/* 2. CENTER: Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-800/40 flex justify-between items-center backdrop-blur-md z-10 shadow-sm">
            <div className="flex items-center">
                 <div className="md:hidden mr-3">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                         <span className="text-xs">☰</span>
                     </div>
                 </div>
                 <div>
                     <h2 className="text-emerald-100 font-semibold text-lg tracking-wide flex items-center gap-2">
                         Clinical Assistant
                         <span className="text-xs font-normal text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
                             {session.messages.length > 0 ? 'Active Session' : 'Ready'}
                         </span>
                     </h2>
                     <p className="text-xs text-slate-500 truncate max-w-[200px]">{session.title}</p>
                 </div>
            </div>
            <div className="flex gap-3">
                <button onClick={handleShare} className="text-sm bg-pink-600/90 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg shadow-pink-900/20 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Share
                </button>
                <button onClick={handleDownloadPDF} className="text-sm bg-slate-700/80 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-white/5 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Download Report
                </button>
            </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-8 custom-scrollbar scroll-smooth">
          {session.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60 pb-20">
                <div className="w-24 h-24 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-emerald-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-emerald-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                     </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">MedScan Clinical Assistant</h3>
                <p className="text-slate-400 text-lg max-w-md text-center">
                    Describe your symptoms or upload a medical image to receive professional AI guidance.
                </p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {["Severe Headache", "Child's Fever > 102°F", "Sprained Ankle", "Skin Rash Interpretation"].map(prompt => (
                        <button 
                            key={prompt}
                            onClick={() => setInput(`I need help with: ${prompt}`)} 
                            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/80 rounded-full text-sm text-cyan-200/80 border border-white/5 transition-all hover:scale-105"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
          )}

          {session.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
              <div className={`relative max-w-[90%] lg:max-w-[85%] rounded-3xl px-6 py-5 shadow-lg transition-all ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-sm shadow-emerald-900/20' 
                  : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-white/5 shadow-black/20'
              }`}>
                {msg.attachments && msg.attachments.map((url, i) => (
                    <img key={i} src={url} alt="User attachment" className="mb-4 rounded-xl max-h-64 border border-white/10 shadow-md" />
                ))}
                
                {/* Message Text - Larger and more readable */}
                <div className="text-base md:text-lg leading-loose tracking-wide whitespace-pre-wrap font-normal">
                    {msg.text}
                </div>
                
                {/* Structured Data Display for AI */}
                {msg.role === 'model' && msg.structuredResponse && (
                    <div className="mt-6 pt-5 border-t border-white/10 space-y-6">
                        {/* Differentials */}
                        {msg.structuredResponse.differentialDiagnosis && msg.structuredResponse.differentialDiagnosis.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase mb-3 tracking-widest">Potential Causes</p>
                                <ul className="space-y-3">
                                    {msg.structuredResponse.differentialDiagnosis.map((dx, idx) => (
                                        <li key={idx} className="bg-black/20 rounded-xl p-3 border border-white/5">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-emerald-200 text-base">{dx.condition}</span>
                                                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full">{dx.confidence}% Match</span>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed">{dx.reasoning}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Actions */}
                        {msg.structuredResponse.recommendedActions && msg.structuredResponse.recommendedActions.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase mb-3 tracking-widest">Recommended Actions</p>
                                <ul className="space-y-2">
                                    {msg.structuredResponse.recommendedActions.map((action, idx) => (
                                        <li key={idx} className="flex items-start text-base text-slate-200">
                                            <span className="mr-3 text-blue-500">•</span>
                                            <span className="leading-relaxed">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                         {/* Meds */}
                         {msg.structuredResponse.suggestedMedications && msg.structuredResponse.suggestedMedications.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-purple-400 uppercase mb-3 tracking-widest">Common OTC Options</p>
                                <div className="flex flex-wrap gap-2">
                                    {msg.structuredResponse.suggestedMedications.map((med, idx) => (
                                        <div key={idx} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 flex flex-col text-sm">
                                            <span className="font-bold text-purple-200">{med.name}</span>
                                            <span className="text-xs text-purple-300/70">{med.dose} • {med.frequency}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="mt-3 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium">
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
                 <div className="bg-slate-800 text-slate-400 rounded-3xl rounded-bl-sm p-5 flex items-center space-x-2 border border-white/5 shadow-lg">
                     <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce"></div>
                     <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                     <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 md:p-6 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl z-20">
            {imagePreview && (
                <div className="mb-4 relative inline-block animate-slideUp">
                    <img src={imagePreview} alt="Preview" className="h-24 rounded-xl border border-emerald-500/50 shadow-xl" />
                    <button onClick={() => {setImagePreview(null); setSelectedImage(null);}} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            )}
            <div className="flex items-center gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="p-4 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-all border border-transparent hover:border-white/5" title="Upload Image">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your health question..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                />
                
                <div className="flex items-center gap-2">
                    <AudioControls 
                    isInput 
                    onTranscript={(text) => setInput(prev => prev + ' ' + text)} 
                    />

                    <button 
                        onClick={handleSend} 
                        disabled={!input.trim() && !selectedImage}
                        className={`p-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
                            !input.trim() && !selectedImage
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 3. RIGHT: Context Panel (Existing) */}
      <div className="hidden lg:flex w-80 flex-col gap-5">
        
        {/* Patient Summary Widget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Patient Profile</h3>
             <div className="space-y-4">
                 <div>
                     <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
                     <input 
                       type="text" 
                       value={session.patientSummary.name}
                       onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, name: e.target.value}}))}
                       className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                       placeholder="Optional"
                     />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Age</label>
                        <input
                            type="number"
                            value={session.patientSummary.age || ''}
                            onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, age: parseInt(e.target.value) || 0}}))}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="#"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Sex</label>
                        <select 
                             value={session.patientSummary.sex}
                             onChange={(e) => setSession(prev => ({...prev, patientSummary: {...prev.patientSummary, sex: e.target.value as Sex}}))}
                             className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                     </div>
                 </div>
             </div>
        </div>

        {/* Safety & Audit Widget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Safety & Privacy</h3>
             <div className="space-y-4 flex-1">
                 <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                     <div className="flex items-center text-yellow-400 mb-2">
                         <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                         <span className="text-sm font-bold">Medical Disclaimer</span>
                     </div>
                     <p className="text-xs text-yellow-200/80 leading-relaxed">
                         AI responses are for informational purposes only and do not replace professional medical advice. Call emergency services for critical conditions.
                     </p>
                 </div>

                 <div className="mt-auto pt-4 border-t border-white/5 text-xs text-slate-500 space-y-1">
                     <p>AI Model: Gemini 2.5 Flash</p>
                     <p>Session ID: {session.id.slice(-6)}</p>
                     <p>Data Encryption: TLS 1.3</p>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;
