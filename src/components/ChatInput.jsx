import { useState } from 'react';

export default function ChatInput({ onSubmit, loading }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
    setText('');
  }

  return (
    <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Met Sarah Kim at HackNY last Friday, she's a PM at Stripe, we talked about AI tools..."
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 text-sm
              placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]
              disabled:opacity-50 transition-all"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-teal)', borderTopColor: 'transparent' }} />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-30"
          style={{ background: 'var(--color-teal)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
