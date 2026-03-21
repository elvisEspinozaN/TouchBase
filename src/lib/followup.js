import { updateContact } from './storage.js';

export function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function isOverdue(contact) {
  if (contact.followUpStatus === 'sent') return false;
  const days = daysSince(contact.snoozedUntil || contact.date);
  return days >= contact.followUpDays;
}

export function hasBeenReminded(contact) {
  return contact.remindedOnce === true;
}

export function getOverdueContacts(contacts) {
  return contacts.filter(c => isOverdue(c) && c.followUpStatus !== 'sent');
}

export function snoozeContact(id, contacts, setContacts) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const updated = updateContact(id, {
    snoozedUntil: tomorrow.toISOString().split('T')[0],
    remindedOnce: true,
  });
  setContacts(updated);
}

export function markSent(id, contacts, setContacts) {
  const updated = updateContact(id, { followUpStatus: 'sent' });
  setContacts(updated);
}

export function saveDraft(id, draft, contacts, setContacts) {
  const updated = updateContact(id, {
    followUpStatus: 'drafted',
    draft,
  });
  setContacts(updated);
}
