import { daysSince } from '../lib/followup.js';

function getFreshnessColor(days) {
  if (days <= 3) return 'var(--color-teal)';
  if (days <= 7) return 'var(--color-amber)';
  return 'var(--color-terracotta)';
}

function StatusBadge({ contact }) {
  if (contact.followUpStatus === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded"
        style={{ background: 'var(--color-teal-light)', color: 'var(--color-teal)' }}>
        Sent
      </span>
    );
  }
  if (contact.followUpStatus === 'drafted') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded"
        style={{ background: 'var(--color-amber-light)', color: 'var(--color-amber)' }}>
        Draft
      </span>
    );
  }
  return null;
}

function formatDaysAgo(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ContactCard({ contact, onClick }) {
  const lastContactedDate = contact.lastContacted || contact.date;
  const daysLastContacted = daysSince(lastContactedDate);
  const freshnessColor = getFreshnessColor(daysLastContacted);

  return (
    <button
      onClick={() => onClick(contact)}
      className="group bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] border-l-[3px]
        p-4 text-left cursor-pointer w-full
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
      style={{ borderLeftColor: freshnessColor }}
    >
      {/* Name + status */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-2xl leading-tight truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {contact.name}
        </h3>
        <StatusBadge contact={contact} />
      </div>

      {/* Role */}
      {contact.role && (
        <p className="text-xs italic mt-0.5 truncate" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          {contact.role}
        </p>
      )}

      {/* Divider + meta */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs font-medium truncate" style={{ color: 'var(--color-teal)' }}>
          {contact.event}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-faint)' }}>
          Last talked {formatDaysAgo(daysLastContacted)}
        </p>
      </div>

      {/* Topics */}
      {contact.topics?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {contact.topics.slice(0, 2).map((t, i) => (
            <span key={i} className="text-[11px] italic px-1.5 py-0.5 rounded truncate max-w-[100px]"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
