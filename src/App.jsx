import { useEffect, useState } from 'react';
import CardGrid from './components/CardGrid.jsx';
import ChatInput from './components/ChatInput.jsx';
import ReminderBanner from './components/ReminderBanner.jsx';
import FollowUpModal from './components/FollowUpModal.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import { parseContact, generateFollowUp } from './lib/claude.js';
import { addContact, deleteContact, loadContacts, updateContact } from './lib/storage.js';
import { getMarkSentUpdates, getOverdueContacts, getSaveDraftUpdates, getSnoozeUpdates, hasDraft } from './lib/followup.js';
import { getSession, onAuthStateChange, signOut } from './lib/auth.js';

function isOverdueAfterSnooze(contact) {
  if (!contact.snoozedUntil) return false;
  return new Date() >= new Date(contact.snoozedUntil);
}

function replaceContact(contacts, updatedContact) {
  return contacts.map(contact => contact.id === updatedContact.id ? updatedContact : contact);
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

  useEffect(() => {
    getSession()
      .then(session => {
        setUser(session?.user ?? null);
      })
      .catch(sessionError => {
        setError(sessionError.message || 'Failed to restore your session.');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  useEffect(() => {
    const subscription = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);

      if (!session) {
        setContacts([]);
        setSelectedContact(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let cancelled = false;

    async function initializeContacts() {
      try {
        const loaded = await loadContacts();
        if (cancelled) return;

        setContacts(loaded);

        // Auto-draft for contacts that were snoozed and are overdue again
        let current = [...loaded];
        for (const contact of loaded) {
          if (contact.remindedOnce && contact.followUpStatus === 'pending' && isOverdueAfterSnooze(contact)) {
            try {
              const draft = await generateFollowUp(contact);
              const updatedContact = await updateContact(contact.id, getSaveDraftUpdates(draft));
              current = replaceContact(current, updatedContact);
              if (!cancelled) {
                setContacts(current);
              }
            } catch (autoDraftError) {
              console.error('Auto-draft failed for contact', contact.id, autoDraftError);
            }
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Failed to load contacts from Supabase.');
        }
      }
    }

    initializeContacts();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleAddContact(text) {
    setParsing(true);
    setError(null);

    try {
      const results = await parseContact(text);

      for (const parsed of results) {
        await addContact({
          followUpStatus: 'pending',
          remindedOnce: false,
          ...parsed,
          lastContacted: parsed.lastContacted || parsed.date,
          draftSubject: '',
          draftBody: '',
        });
      }

      const refreshed = await loadContacts();
      setContacts(refreshed);
    } catch (parseError) {
      setError(parseError.message || 'Failed to parse contact. Check your API key in .env');
    } finally {
      setParsing(false);
    }
  }

  async function handleSnooze(id) {
    try {
      const updatedContact = await updateContact(id, getSnoozeUpdates());
      setContacts(prev => replaceContact(prev, updatedContact));
      setSelectedContact(prev => prev?.id === id ? updatedContact : prev);
    } catch (snoozeError) {
      setError(snoozeError.message || 'Failed to snooze reminder.');
    }
  }

  async function handleDraftNow(contact) {
    if (contact.followUpStatus === 'drafted' || hasDraft(contact)) {
      setSelectedContact(contact);
      return;
    }

    setDraftingReminder(true);
    try {
      const draft = await generateFollowUp(contact);
      const updatedContact = await updateContact(contact.id, getSaveDraftUpdates(draft));
      setContacts(prev => replaceContact(prev, updatedContact));
      setSelectedContact(updatedContact);
    } catch (draftError) {
      setError(draftError.message || 'Failed to generate follow-up. Try again.');
    } finally {
      setDraftingReminder(false);
    }
  }

  async function handleGenerateDraftInModal(contact) {
    setDrafting(true);
    try {
      const draft = await generateFollowUp(contact);
      const updatedContact = await updateContact(contact.id, getSaveDraftUpdates(draft));
      setContacts(prev => replaceContact(prev, updatedContact));
      setSelectedContact(updatedContact);
      return draft;
    } catch (draftError) {
      setError(draftError.message || 'Failed to generate follow-up. Try again.');
      return null;
    } finally {
      setDrafting(false);
    }
  }

  async function handleMarkSent(id, draftUpdates = {}) {
    try {
      const updatedContact = await updateContact(id, getMarkSentUpdates(draftUpdates));
      setContacts(prev => replaceContact(prev, updatedContact));
      setSelectedContact(prev => prev?.id === id ? updatedContact : prev);
    } catch (statusError) {
      setError(statusError.message || 'Failed to update follow-up status.');
    }
  }

  async function handleUpdateLastContacted(id, date) {
    try {
      const updatedContact = await updateContact(id, { lastContacted: date });
      setContacts(prev => replaceContact(prev, updatedContact));
      setSelectedContact(prev => prev?.id === id ? updatedContact : prev);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update last-contacted date.');
    }
  }

  async function handleDeleteContact(id) {
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setSelectedContact(prev => prev?.id === id ? null : prev);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete contact.');
    }
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

  if (!user) {
    return <LoginScreen />;
  }

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
