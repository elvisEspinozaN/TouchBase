import ContactCard from './ContactCard.jsx';

export default function CardGrid({ contacts, onCardClick }) {
  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: 'var(--color-teal-light)' }}>
          🤝
        </div>
        <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Your network starts here
        </h2>
        <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          Describe someone you met below and we'll create a card for them automatically.
        </p>
      </div>
    );
  }

  const sorted = [...contacts].sort((a, b) => {
    const dateA = new Date(a.lastContacted || a.date);
    const dateB = new Date(b.lastContacted || b.date);
    return dateB - dateA;
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sorted.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
