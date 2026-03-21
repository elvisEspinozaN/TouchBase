import ContactCard from './ContactCard.jsx';

export default function CardGrid({ contacts, onCardClick }) {
  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl mb-4">
          🤝
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your network starts here</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Describe someone you met below and the AI will create a card for them automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...contacts].sort((a, b) => {
          const dateA = new Date(a.lastContacted || a.date);
          const dateB = new Date(b.lastContacted || b.date);
          return dateB - dateA;
        }).map(contact => (
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
