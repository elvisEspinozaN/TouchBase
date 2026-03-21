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
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. Met Sarah Kim at HackNY last Friday, she's a PM at Stripe, we talked about AI tools..."
            disabled={loading}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              disabled:opacity-50 transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 rounded-xl
            flex items-center justify-center text-white transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
