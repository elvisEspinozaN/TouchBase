import { daysSince } from '../lib/followup.js';

const rotations = [-2, -1, 0, 1, 2];

function getRotation(id) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return rotations[sum % rotations.length];
}

function StatusDot({ contact }) {
  const days = daysSince(contact.date);
  if (contact.followUpStatus === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <span>✓</span> Sent
      </span>
    );
  }
  if (contact.followUpStatus === 'drafted') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
        Draft ready
      </span>
    );
  }
  if (days < 3) {
    return <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" title="Follow up not yet needed" />;
  }
  if (days < 7) {
    return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block animate-pulse" title="Follow up soon" />;
  }
  return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" title="Overdue!" />;
}

export default function ContactCard({ contact, onClick }) {
  const rotation = getRotation(contact.id);
  const days = daysSince(contact.date);

  return (
    <button
      onClick={() => onClick(contact)}
      style={{ transform: `rotate(${rotation}deg)` }}
      className="group bg-white rounded-2xl shadow-md border border-gray-100 p-4 text-left cursor-pointer
        hover:scale-105 hover:shadow-xl hover:rotate-0 transition-all duration-200 ease-out
        w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {contact.name?.[0]?.toUpperCase() || '?'}
        </div>
        <StatusDot contact={contact} />
      </div>

      <h3 className="font-semibold text-gray-900 text-sm leading-tight mt-2 truncate">
        {contact.name}
      </h3>
      {contact.role && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{contact.role}</p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-indigo-600 font-medium truncate">{contact.event}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`}
        </p>
      </div>

      {contact.topics?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.topics.slice(0, 2).map((t, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md truncate max-w-[90px]">
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
