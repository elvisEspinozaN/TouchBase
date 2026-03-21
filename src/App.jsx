import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CardGrid from './components/CardGrid.jsx';
import ChatInput from './components/ChatInput.jsx';
import ReminderBanner from './components/ReminderBanner.jsx';
import FollowUpModal from './components/FollowUpModal.jsx';
import { parseContact, generateFollowUp } from './lib/claude.js';
import { loadContacts, addContact, updateContact, deleteContact } from './lib/storage.js';
import { getOverdueContacts, snoozeContact, markSent, saveDraft } from './lib/followup.js';

function isOverdueAfterSnooze(contact) {
  if (!contact.snoozedUntil) return false;
  return new Date() >= new Date(contact.snoozedUntil);
}

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState(null);
  const [draftingReminder, setDraftingReminder] = useState(false);

  useEffect(() => {
    const loaded = loadContacts();
    setContacts(loaded);

    // Auto-draft for contacts that were snoozed and are overdue again
    const autoDraft = async () => {
      let current = [...loaded];
      for (const c of current) {
        if (c.remindedOnce && c.followUpStatus === 'pending' && isOverdueAfterSnooze(c)) {
          try {
            const draft = await generateFollowUp(c);
            const updated = updateContact(c.id, { followUpStatus: 'drafted', draft });
            current = updated;
            setContacts([...updated]);
          } catch {}
        }
      }
    };
    autoDraft();
  }, []);

  async function handleAddContact(text) {
    setParsing(true);
    setError(null);
    try {
      const results = await parseContact(text);
      let updated;
      for (const parsed of results) {
        const contact = {
          id: uuidv4(),
          followUpStatus: 'pending',
          remindedOnce: false,
          ...parsed,
          lastContacted: parsed.lastContacted || parsed.date,
        };
        updated = addContact(contact);
      }
      setContacts(updated);
    } catch (e) {
      setError(e.message || 'Failed to parse contact. Check your API key in .env');
    } finally {
      setParsing(false);
    }
  }

  function handleSnooze(id) {
    snoozeContact(id, contacts, setContacts);
  }

  async function handleDraftNow(contact) {
    if (contact.followUpStatus === 'drafted' || contact.draft) {
      setSelectedContact(contact);
      return;
    }
    setDraftingReminder(true);
    try {
      const draft = await generateFollowUp(contact);
      saveDraft(contact.id, draft, contacts, setContacts);
      setSelectedContact({ ...contact, followUpStatus: 'drafted', draft });
    } catch (e) {
      setError('Failed to generate follow-up. Try again.');
    } finally {
      setDraftingReminder(false);
    }
  }

  async function handleGenerateDraftInModal(contact) {
    setDrafting(true);
    try {
      const draft = await generateFollowUp(contact);
      saveDraft(contact.id, draft, contacts, setContacts);
      const updatedContact = { ...contact, followUpStatus: 'drafted', draft };
      setSelectedContact(updatedContact);
      return draft;
    } catch (e) {
      setError('Failed to generate follow-up. Try again.');
      return null;
    } finally {
      setDrafting(false);
    }
  }

  function handleMarkSent(id) {
    markSent(id, contacts, setContacts);
    setSelectedContact(prev => prev?.id === id ? { ...prev, followUpStatus: 'sent' } : prev);
  }

  function handleUpdateLastContacted(id, date) {
    const updated = updateContact(id, { lastContacted: date });
    setContacts(updated);
    setSelectedContact(prev => prev?.id === id ? { ...prev, lastContacted: date } : prev);
  }

  function handleDeleteContact(id) {
    const updated = deleteContact(id);
    setContacts(updated);
  }

  const overdue = getOverdueContacts(contacts);
  const topReminder = overdue[0] || null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <h1 className="text-xl font-bold text-gray-900">Touchbase</h1>
        </div>
        <div className="flex items-center gap-3">
          {contacts.length > 0 && (
            <span className="text-sm text-gray-400">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </span>
          )}
          {overdue.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {overdue.length} overdue
            </span>
          )}
        </div>
      </header>

      {/* Reminder banner */}
      {topReminder && (
        <ReminderBanner
          contact={topReminder}
          onSnooze={handleSnooze}
          onDraftNow={handleDraftNow}
          loading={draftingReminder}
        />
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xl leading-none ml-4">×</button>
        </div>
      )}

      {/* Card grid */}
      <CardGrid contacts={contacts} onCardClick={setSelectedContact} />

      {/* Chat input */}
      <ChatInput onSubmit={handleAddContact} loading={parsing} />

      {/* Modal */}
      {selectedContact && (
        <FollowUpModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onGenerateDraft={handleGenerateDraftInModal}
          onMarkSent={handleMarkSent}
          onDelete={handleDeleteContact}
          onUpdateLastContacted={handleUpdateLastContacted}
          drafting={drafting}
        />
      )}
    </div>
  );
}
