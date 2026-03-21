import { daysSince, hasBeenReminded } from '../lib/followup.js';

export default function ReminderBanner({ contact, onSnooze, onDraftNow, loading }) {
  if (!contact) return null;

  const days = daysSince(contact.lastContacted || contact.date);
  const alreadyReminded = hasBeenReminded(contact);

  return (
    <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ background: 'var(--color-terracotta-light)', borderBottom: '1px solid #EACFC7' }}>
      <div className="flex-1 min-w-0">
        <span className="text-sm" style={{ color: 'var(--color-terracotta)' }}>
          {alreadyReminded ? 'Still waiting to follow up — ' : 'Time to follow up — '}
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{contact.name}</span>
          {' from '}
          <span className="font-medium">{contact.event}</span>
          {' · '}
          {days} {days === 1 ? 'day' : 'days'} ago
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!alreadyReminded && (
          <button
            onClick={() => onSnooze(contact.id)}
            className="text-xs rounded-lg px-3 py-1.5 transition-colors font-medium"
            style={{ color: 'var(--color-terracotta)', border: '1px solid var(--color-terracotta)', opacity: 0.7 }}
            onMouseEnter={e => e.target.style.opacity = '1'}
            onMouseLeave={e => e.target.style.opacity = '0.7'}
          >
            Remind me tomorrow
          </button>
        )}
        <button
          onClick={() => onDraftNow(contact)}
          disabled={loading}
          className="text-xs text-white rounded-lg px-3 py-1.5 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5"
          style={{ background: 'var(--color-terracotta)' }}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Drafting...
            </>
          ) : contact.followUpStatus === 'drafted' ? (
            'Review & Send'
          ) : (
            'Draft message now'
          )}
        </button>
      </div>
    </div>
  );
}
