import { getSession } from './auth.js';
import { getSupabaseClient } from './supabase.js';

function todayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

function normalizeTopics(topics) {
  if (!Array.isArray(topics)) {
    return [];
  }

  return topics
    .filter(topic => typeof topic === 'string')
    .map(topic => topic.trim())
    .filter(Boolean);
}

function normalizeDraftFields(source) {
  if ('draft' in source && source.draft) {
    return {
      draftSubject: source.draft.subject ?? '',
      draftBody: source.draft.body ?? '',
    };
  }

  return {
    draftSubject: source.draftSubject ?? '',
    draftBody: source.draftBody ?? '',
  };
}

async function requireUser() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    throw new Error('Sign in is required before contacts can sync with Supabase.');
  }

  return user;
}

export function rowToContact(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? '',
    event: row.event ?? '',
    date: row.met_on ?? todayIsoDate(),
    lastContacted: row.last_contacted_on ?? row.met_on ?? todayIsoDate(),
    topics: normalizeTopics(row.topics),
    notes: row.notes ?? '',
    email: row.email ?? '',
    followUpDays: row.follow_up_days ?? 3,
    followUpStatus: row.follow_up_status ?? 'pending',
    remindedOnce: row.reminded_once === true,
    snoozedUntil: row.snoozed_until ?? null,
    draftSubject: row.draft_subject ?? '',
    draftBody: row.draft_body ?? '',
  };
}

function contactToInsert(contact, userId) {
  if (!contact.name?.trim()) {
    throw new Error('Contact name is required.');
  }

  const metOn = contact.date || todayIsoDate();
  const lastContacted = contact.lastContacted || metOn;
  const { draftSubject, draftBody } = normalizeDraftFields(contact);

  return {
    user_id: userId,
    name: contact.name.trim(),
    role: contact.role ?? '',
    event: contact.event ?? '',
    met_on: metOn,
    last_contacted_on: lastContacted,
    topics: normalizeTopics(contact.topics),
    notes: contact.notes ?? '',
    email: contact.email ?? '',
    follow_up_days: contact.followUpDays ?? 3,
    follow_up_status: contact.followUpStatus ?? 'pending',
    reminded_once: contact.remindedOnce === true,
    snoozed_until: contact.snoozedUntil ?? null,
    draft_subject: draftSubject || null,
    draft_body: draftBody || null,
  };
}

function updatesToRowPatch(updates) {
  const patch = {};

  if ('name' in updates) patch.name = updates.name?.trim() ?? '';
  if ('role' in updates) patch.role = updates.role ?? '';
  if ('event' in updates) patch.event = updates.event ?? '';
  if ('date' in updates) patch.met_on = updates.date ?? todayIsoDate();
  if ('lastContacted' in updates) patch.last_contacted_on = updates.lastContacted ?? todayIsoDate();
  if ('topics' in updates) patch.topics = normalizeTopics(updates.topics);
  if ('notes' in updates) patch.notes = updates.notes ?? '';
  if ('email' in updates) patch.email = updates.email ?? '';
  if ('followUpDays' in updates) patch.follow_up_days = updates.followUpDays ?? 3;
  if ('followUpStatus' in updates) patch.follow_up_status = updates.followUpStatus ?? 'pending';
  if ('remindedOnce' in updates) patch.reminded_once = updates.remindedOnce === true;
  if ('snoozedUntil' in updates) patch.snoozed_until = updates.snoozedUntil ?? null;

  if ('draft' in updates || 'draftSubject' in updates || 'draftBody' in updates) {
    const { draftSubject, draftBody } = normalizeDraftFields(updates);
    patch.draft_subject = draftSubject || null;
    patch.draft_body = draftBody || null;
  }

  return patch;
}

export async function loadContacts() {
  await requireUser();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('last_contacted_on', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(rowToContact);
}

export async function addContact(contact) {
  const user = await requireUser();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('contacts')
    .insert(contactToInsert(contact, user.id))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return rowToContact(data);
}

export async function updateContact(id, updates) {
  await requireUser();
  const supabase = getSupabaseClient();
  const patch = updatesToRowPatch(updates);
  const { data, error } = await supabase
    .from('contacts')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return rowToContact(data);
}

export async function deleteContact(id) {
  await requireUser();
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
