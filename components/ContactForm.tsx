
import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

interface ContactFormProps {
  initialContact?: Contact | null;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialContact, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Marathi'>('English');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name);
      setRelation(initialContact.relation);
      setPhone(initialContact.phone);
      setLanguage(initialContact.language);
    }
  }, [initialContact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Name and Phone Number are required.");
      return;
    }

    const contact: Contact = {
      id: initialContact?.id || Date.now().toString(),
      name,
      relation: relation || 'Family',
      phone,
      language
    };

    onSave(contact);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        {initialContact ? 'Edit Contact' : 'Add New Contact'}
      </h3>
      
      {error && (
        <div className="mb-4 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-pink-500"
            placeholder="e.g. Mom"
          />
        </div>
        
        <div>
          <label className="block text-xs text-slate-400 mb-1">Relation</label>
          <input
            type="text"
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-pink-500"
            placeholder="e.g. Mother"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Phone Number (with Country Code)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-pink-500"
            placeholder="e.g. +919876543210"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Preferred Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-pink-500"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded text-sm bg-pink-600 hover:bg-pink-500 text-white font-medium shadow-lg shadow-pink-900/20 transition-all"
        >
          Save Contact
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
