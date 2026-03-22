export function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function isOverdue(contact) {
  if (contact.followUpStatus === 'sent') return false;
  const days = daysSince(contact.snoozedUntil || contact.lastContacted || contact.date);
  return days >= 2;
}

export function hasBeenReminded(contact) {
  return contact.remindedOnce === true;
}

export function getOverdueContacts(contacts) {
  return contacts.filter(contact => isOverdue(contact) && contact.followUpStatus !== 'sent');
}

export function hasDraft(contact) {
  return Boolean(contact.draftSubject || contact.draftBody);
}

export function getSnoozeUpdates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    snoozedUntil: tomorrow.toISOString().split('T')[0],
    remindedOnce: true,
  };
}

export function getMarkSentUpdates(draftUpdates = {}) {
  return {
    ...draftUpdates,
    followUpStatus: 'sent',
  };
}

export function getSaveDraftUpdates(draft) {
  return {
    followUpStatus: 'drafted',
    draftSubject: draft.subject ?? '',
    draftBody: draft.body ?? '',
  };
}
