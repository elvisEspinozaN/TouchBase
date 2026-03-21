const STORAGE_KEY = 'networking_contacts';

export function loadContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export function addContact(contact) {
  const contacts = loadContacts();
  contacts.unshift(contact);
  saveContacts(contacts);
  return contacts;
}

export function updateContact(id, updates) {
  const contacts = loadContacts();
  const idx = contacts.findIndex(c => c.id === id);
  if (idx === -1) return contacts;
  contacts[idx] = { ...contacts[idx], ...updates };
  saveContacts(contacts);
  return contacts;
}

export function deleteContact(id) {
  const contacts = loadContacts().filter(c => c.id !== id);
  saveContacts(contacts);
  return contacts;
}
