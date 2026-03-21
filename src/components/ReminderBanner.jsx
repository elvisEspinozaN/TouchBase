import { daysSince, hasBeenReminded } from '../lib/followup.js';

export default function ReminderBanner({ contacts, onSnooze, onDraftNow, loading }) {
  if (!contacts || contacts.length === 0) return null;

  const sorted = [...contacts].sort((a, b) => {
    const daysA = daysSince(a.lastContacted || a.date);
    const daysB = daysSince(b.lastContacted || b.date);
    return daysB - daysA;
  });

  return (
    <div className="px-5 py-3 space-y-2" style={{ background: 'var(--color-terracotta-light)', borderBottom: '1px solid #EACFC7' }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-terracotta)' }}>
        {contacts.length} follow-up{contacts.length > 1 ? 's' : ''} needed
      </p>
      {sorted.map(contact => {
        const days = daysSince(contact.lastContacted || contact.date);
        const alreadyReminded = hasBeenReminded(contact);

        return (
          <div key={contact.id} className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <span className="text-sm" style={{ color: 'var(--color-terracotta)' }}>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1em' }}>{contact.name}</span>
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
                  className="text-[11px] rounded-lg px-2.5 py-1 transition-colors font-medium"
                  style={{ color: 'var(--color-terracotta)', border: '1px solid var(--color-terracotta)', opacity: 0.7 }}
                  onMouseEnter={e => e.target.style.opacity = '1'}
                  onMouseLeave={e => e.target.style.opacity = '0.7'}
                >
                  Snooze
                </button>
              )}
              <button
                onClick={() => onDraftNow(contact)}
                disabled={loading}
                className="text-[11px] text-white rounded-lg px-2.5 py-1 transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5"
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
                  'Draft message'
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
