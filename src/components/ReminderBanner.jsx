import { daysSince, hasBeenReminded } from '../lib/followup.js';

export default function ReminderBanner({ contact, onSnooze, onDraftNow, loading }) {
  if (!contact) return null;

  const days = daysSince(contact.date);
  const alreadyReminded = hasBeenReminded(contact);

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-amber-600 text-lg">⚡</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-amber-900">
          {alreadyReminded ? 'Still waiting to follow up — ' : 'Time to follow up — '}
          <span className="font-bold">{contact.name}</span>
          {' from '}
          <span className="font-semibold">{contact.event}</span>
          {' · '}
          {days} {days === 1 ? 'day' : 'days'} ago
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!alreadyReminded && (
          <button
            onClick={() => onSnooze(contact.id)}
            className="text-xs text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors"
          >
            Remind me tomorrow
          </button>
        )}
        <button
          onClick={() => onDraftNow(contact)}
          disabled={loading}
          className="text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
