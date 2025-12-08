
import React from 'react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onEdit, onDelete, selectedIds, onToggleSelect }) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
        <p>No contacts saved.</p>
        <p className="text-sm">Add family members to notify them easily.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map(contact => (
        <div 
          key={contact.id} 
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            selectedIds.includes(contact.id) 
            ? 'bg-pink-900/20 border-pink-500/50' 
            : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-4">
             <input
               type="checkbox"
               checked={selectedIds.includes(contact.id)}
               onChange={() => onToggleSelect(contact.id)}
               className="w-5 h-5 rounded border-slate-600 text-pink-500 focus:ring-pink-500 cursor-pointer"
             />
             <div>
                <h4 className="text-white font-medium">{contact.name} <span className="text-xs text-slate-400 font-normal">({contact.relation})</span></h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{contact.phone}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>{contact.language}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(contact)}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(contact.id)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
