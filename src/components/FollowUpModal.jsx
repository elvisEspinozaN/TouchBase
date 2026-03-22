import { useState } from 'react';
import { daysSince } from '../lib/followup.js';

function formatDaysAgo(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function FollowUpModal({ contact, onClose, onGenerateDraft, onMarkSent, onDelete, onUpdateLastContacted, drafting }) {
  const [localSubject, setLocalSubject] = useState(contact.draftSubject || '');
  const [localBody, setLocalBody] = useState(contact.draftBody || '');
  const [copied, setCopied] = useState(false);

  const lastContactedDate = contact.lastContacted || contact.date;
  const days = daysSince(lastContactedDate);
  const hasDraft = Boolean(localSubject || localBody);

  async function handleGenerateDraft() {
    const result = await onGenerateDraft(contact);
    if (result) {
      setLocalSubject(result.subject);
      setLocalBody(result.body);
    }
  }

  function handleSendEmail() {
    const subject = encodeURIComponent(localSubject || `Following up from ${contact.event}`);
    const body = encodeURIComponent(localBody || '');
    const to = contact.email ? encodeURIComponent(contact.email) : '';
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    onUpdateLastContacted(contact.id, new Date().toISOString().split('T')[0]);
    onMarkSent(contact.id, {
      draftSubject: localSubject,
      draftBody: localBody,
    });
  }

  function handleCopyLinkedIn() {
    navigator.clipboard.writeText(localBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onUpdateLastContacted(contact.id, new Date().toISOString().split('T')[0]);
    onMarkSent(contact.id, {
      draftSubject: localSubject,
      draftBody: localBody,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(45,42,38,0.4)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{contact.name}</h2>
              {contact.role && <p className="text-sm italic mt-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>{contact.role}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-bg)]" style={{ color: 'var(--color-text-faint)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2.5 mt-4 text-sm">
            <span className="px-2 py-0.5 rounded-md font-medium text-xs" style={{ background: 'var(--color-teal-light)', color: 'var(--color-teal)' }}>
              {contact.event}
            </span>
            <span style={{ color: 'var(--color-text-faint)' }}>·</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{formatDaysAgo(days)}</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          {contact.topics?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Topics discussed</p>
              <div className="flex flex-wrap gap-1.5">
                {contact.topics.map((topic, index) => (
                  <span key={index} className="text-sm px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>{topic}</span>
                ))}
              </div>
            </div>
          )}
          {contact.notes && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-faint)' }}>Notes</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{contact.notes}</p>
            </div>
          )}
          {contact.email && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-faint)' }}>Email</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{contact.email}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-faint)' }}>Last contacted</p>
            <input
              type="date"
              value={lastContactedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={event => onUpdateLastContacted(contact.id, event.target.value)}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)', background: 'var(--color-surface)' }}
            />
          </div>
        </div>

        {/* Follow-up section */}
        <div className="p-6 space-y-4">
          {!hasDraft ? (
            <button
              onClick={handleGenerateDraft}
              disabled={drafting}
              className="w-full text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--color-teal)' }}
              onMouseEnter={event => !drafting && (event.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={event => { event.currentTarget.style.filter = ''; }}
            >
              {drafting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating message...
                </>
              ) : (
                'Generate Follow-up Message'
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-faint)' }}>Follow-up draft</p>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Subject</label>
                <input
                  type="text"
                  value={localSubject}
                  onChange={event => setLocalSubject(event.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
                  style={{ border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>Message</label>
                <textarea
                  value={localBody}
                  onChange={event => setLocalBody(event.target.value)}
                  rows={5}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] resize-none"
                  style={{ border: '1px solid var(--color-border)' }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendEmail}
                  className="flex-1 text-white rounded-lg py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--color-teal)' }}
                  onMouseEnter={event => { event.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={event => { event.currentTarget.style.filter = ''; }}
                >
                  Send Email
                </button>
                <button
                  onClick={handleCopyLinkedIn}
                  className="flex-1 text-white rounded-lg py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  style={{ background: '#0A66C2' }}
                  onMouseEnter={event => { event.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={event => { event.currentTarget.style.filter = ''; }}
                >
                  {copied ? 'Copied!' : 'Copy for LinkedIn'}
                </button>
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={drafting}
                className="w-full text-xs py-1 transition-colors"
                style={{ color: 'var(--color-text-faint)' }}
                onMouseEnter={event => { event.currentTarget.style.color = 'var(--color-text-muted)'; }}
                onMouseLeave={event => { event.currentTarget.style.color = 'var(--color-text-faint)'; }}
              >
                Regenerate message
              </button>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { onDelete(contact.id); onClose(); }}
            className="w-full text-xs py-1 mt-2 transition-colors"
            style={{ color: 'var(--color-terracotta)' }}
            onMouseEnter={event => { event.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={event => { event.currentTarget.style.opacity = '1'; }}
          >
            Remove contact
          </button>
        </div>
      </div>
    </div>
  );
}
