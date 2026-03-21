import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CardGrid from './components/CardGrid.jsx';
import ChatInput from './components/ChatInput.jsx';
import ReminderBanner from './components/ReminderBanner.jsx';
import FollowUpModal from './components/FollowUpModal.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import { parseContact, generateFollowUp } from './lib/claude.js';
import { loadContacts, addContact, updateContact, deleteContact } from './lib/storage.js';
import { getOverdueContacts, snoozeContact, markSent, saveDraft } from './lib/followup.js';
import { getSession, onAuthStateChange, signOut } from './lib/auth.js';

function isOverdueAfterSnooze(contact) {
  if (!contact.snoozedUntil) return false;
  return new Date() >= new Date(contact.snoozedUntil);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState(null);
  const [draftingReminder, setDraftingReminder] = useState(false);

  // Session check on mount
  useEffect(() => {
    getSession().then(session => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
  }, []);

  // Auth state listener
  useEffect(() => {
    const sub = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) setContacts([]);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7f4' }}>
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🤝</span>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Touchbase</h1>
        </div>
        <div className="flex items-center gap-3">
          {contacts.length > 0 && (
            <span className="text-sm" style={{ color: 'var(--color-text-faint)' }}>
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
            </span>
          )}
          {overdue.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-terracotta-light)', color: 'var(--color-terracotta)' }}>
              {overdue.length} overdue
            </span>
          )}
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[140px]">
            {user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            Log out
          </button>
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
        <div className="px-5 py-2.5 flex items-center justify-between" style={{ background: 'var(--color-terracotta-light)', borderBottom: '1px solid #EACFC7' }}>
          <p className="text-sm" style={{ color: 'var(--color-terracotta)' }}>{error}</p>
          <button onClick={() => setError(null)} className="text-xl leading-none ml-4" style={{ color: 'var(--color-terracotta)', opacity: 0.5 }}>×</button>
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
