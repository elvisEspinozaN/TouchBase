import { useState } from 'react';
import { daysSince } from '../lib/followup.js';

export default function FollowUpModal({ contact, onClose, onGenerateDraft, onMarkSent, onDelete, onUpdateLastContacted, drafting }) {
  const [draft, setDraft] = useState(contact.draft || null);
  const [localSubject, setLocalSubject] = useState(contact.draft?.subject || '');
  const [localBody, setLocalBody] = useState(contact.draft?.body || '');
  const [copied, setCopied] = useState(false);

  const lastContactedDate = contact.lastContacted || contact.date;
  const days = daysSince(lastContactedDate);

  async function handleGenerateDraft() {
    const result = await onGenerateDraft(contact);
    if (result) {
      setDraft(result);
      setLocalSubject(result.subject);
      setLocalBody(result.body);
    }
  }

  function handleSendEmail() {
    const subject = encodeURIComponent(localSubject || `Following up from ${contact.event}`);
    const body = encodeURIComponent(localBody || '');
    const to = contact.email ? encodeURIComponent(contact.email) : '';
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    onMarkSent(contact.id);
  }

  function handleCopyLinkedIn() {
    const text = `${localBody}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onMarkSent(contact.id);
  }

  const hasDraft = (draft || contact.draft) && localBody;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {contact.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{contact.name}</h2>
                {contact.role && <p className="text-sm text-gray-500">{contact.role}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4 text-sm text-gray-600">
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-medium">{contact.event}</span>
            <span className="text-gray-400">·</span>
            <span>{days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`}</span>
          </div>
        </div>

        {/* Topics + Notes */}
        <div className="p-6 border-b border-gray-100 space-y-3">
          {contact.topics?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Topics discussed</p>
              <div className="flex flex-wrap gap-1.5">
                {contact.topics.map((t, i) => (
                  <span key={i} className="text-sm bg-gray-100 text-gray-700 px-2.5 py-1 rounded-xl">{t}</span>
                ))}
              </div>
            </div>
          )}
          {contact.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{contact.notes}</p>
            </div>
          )}
          {contact.email && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-gray-700">{contact.email}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last contacted</p>
            <input
              type="date"
              value={lastContactedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => onUpdateLastContacted(contact.id, e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Follow-up section */}
        <div className="p-6 space-y-4">
          {!hasDraft ? (
            <button
              onClick={handleGenerateDraft}
              disabled={drafting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-2xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {drafting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating message...
                </>
              ) : (
                <>
                  <span>✨</span> Generate Follow-up Message
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Follow-up draft</p>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Subject</label>
                <input
                  type="text"
                  value={localSubject}
                  onChange={e => setLocalSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Message</label>
                <textarea
                  value={localBody}
                  onChange={e => setLocalBody(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendEmail}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>✉️</span> Send Email
                </button>
                <button
                  onClick={handleCopyLinkedIn}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {copied ? '✓ Copied!' : <><span>💼</span> Copy for LinkedIn</>}
                </button>
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={drafting}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                Regenerate message
              </button>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { onDelete(contact.id); onClose(); }}
            className="w-full text-xs text-red-400 hover:text-red-600 transition-colors py-1 mt-2"
          >
            Remove contact
          </button>
        </div>
      </div>
    </div>
  );
}
