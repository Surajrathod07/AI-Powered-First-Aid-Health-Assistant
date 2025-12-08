
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import ContactForm from './ContactForm';
import ContactList from './ContactList';
import { generateFamilyMessage } from '../services/aiService';

interface FamilyAlertViewProps {
  initialSummary?: string;
  patientName?: string;
}

const FamilyAlertView: React.FC<FamilyAlertViewProps> = ({ initialSummary, patientName }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [medicalSummary, setMedicalSummary] = useState(initialSummary || "I am feeling unwell and wanted to let you know.");
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, string>>({}); // lang -> message
  const [isGenerating, setIsGenerating] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    const saved = localStorage.getItem('medscan_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) { console.error("Failed to parse contacts"); }
    }
  }, []);

  // Save contacts on change
  useEffect(() => {
    localStorage.setItem('medscan_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleSaveContact = (contact: Contact) => {
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
    } else {
      setContacts(prev => [...prev, contact]);
    }
    setShowForm(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedMessages({}); // Clear old

    // Find languages needed
    const targetLangs = new Set<string>();
    contacts.filter(c => selectedIds.includes(c.id)).forEach(c => targetLangs.add(c.language));

    const newMessages: Record<string, string> = {};
    
    try {
        for (const lang of Array.from(targetLangs)) {
            const msg = await generateFamilyMessage(medicalSummary, patientName || "Me", lang);
            newMessages[lang] = msg;
        }
        setGeneratedMessages(newMessages);
    } catch (e) {
        console.error("Gen failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const getMessageForContact = (contact: Contact) => {
    return generatedMessages[contact.language] || "";
  };

  const buildLinks = (contact: Contact, message: string) => {
    const encoded = encodeURIComponent(message);
    const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
    return {
      whatsapp: `https://wa.me/${cleanPhone}?text=${encoded}`,
      sms: `sms:${cleanPhone}?body=${encoded}`,
      tel: `tel:${cleanPhone}`
    };
  };

  return (
    <div className="animate-fadeIn pb-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
           <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start">
             <span className="bg-pink-500/20 text-pink-400 p-2 rounded-lg mr-3">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
               </svg>
             </span>
             Family Alert
           </h2>
           <p className="text-slate-400">Manage emergency contacts and send health updates quickly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Contacts */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Contacts</h3>
                    <button 
                      onClick={() => { setEditingContact(null); setShowForm(true); }}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Add Contact
                    </button>
                </div>
                
                {showForm ? (
                    <ContactForm 
                      initialContact={editingContact}
                      onSave={handleSaveContact} 
                      onCancel={() => { setShowForm(false); setEditingContact(null); }} 
                    />
                ) : (
                    <ContactList 
                      contacts={contacts}
                      onEdit={(c) => { setEditingContact(c); setShowForm(true); }}
                      onDelete={handleDeleteContact}
                      selectedIds={selectedIds}
                      onToggleSelect={toggleSelect}
                    />
                )}
            </div>

            {/* RIGHT: Message Preview */}
            <div className="space-y-6">
                
                {/* Summary Editor */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-2">Medical Status Summary</h3>
                    <p className="text-xs text-slate-400 mb-3">
                        This text is used by AI to generate the message. You can edit it if needed.
                    </p>
                    <textarea 
                        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                        value={medicalSummary}
                        onChange={(e) => setMedicalSummary(e.target.value)}
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={selectedIds.length === 0 || isGenerating}
                        className={`w-full mt-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                            selectedIds.length === 0 || isGenerating
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transform hover:-translate-y-1'
                        }`}
                    >
                        {isGenerating ? 'Generating Messages...' : `Generate Message for ${selectedIds.length} Contact${selectedIds.length !== 1 ? 's' : ''}`}
                    </button>
                </div>

                {/* Generated Messages & Actions */}
                {Object.keys(generatedMessages).length > 0 && (
                     <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl animate-slideUp">
                        <h3 className="text-lg font-bold text-white mb-4">Ready to Send</h3>
                        
                        <div className="space-y-6">
                            {contacts.filter(c => selectedIds.includes(c.id)).map(contact => {
                                const msg = getMessageForContact(contact);
                                const links = buildLinks(contact, msg);
                                
                                return (
                                    <div key={contact.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-pink-300">{contact.name}</span>
                                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{contact.language}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 italic mb-4">"{msg}"</p>
                                        
                                        <div className="flex gap-2">
                                            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center transition-colors">
                                                WhatsApp
                                            </a>
                                            <a href={links.sms} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center transition-colors">
                                                SMS
                                            </a>
                                            <a href={links.tel} className="flex-none bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center transition-colors" title={contact.phone}>
                                                📞
                                            </a>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                     </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAlertView;
