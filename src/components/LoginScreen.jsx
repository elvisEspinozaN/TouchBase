import { useState } from 'react';
import { signInWithEmailPassword, signUpWithEmailPassword } from '../lib/auth.js';

export default function LoginScreen() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmailPassword(email, password);
      } else {
        await signUpWithEmailPassword(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      {/* Brand */}
      <div className="text-center mb-8">
        <span className="text-5xl">🤝</span>
        <h1 className="text-4xl mt-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}>Touchbase</h1>
        <p className="mt-1 text-sm italic" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Stay connected after every meet</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {/* Tab toggle */}
        <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => switchMode('signin')}
            className="flex-1 py-3.5 text-sm font-semibold transition-colors"
            style={mode === 'signin'
              ? { color: 'var(--color-teal)', borderBottom: '2px solid var(--color-teal)' }
              : { color: 'var(--color-text-faint)' }}
          >
            Sign in
          </button>
          <button
            onClick={() => switchMode('signup')}
            className="flex-1 py-3.5 text-sm font-semibold transition-colors"
            style={mode === 'signup'
              ? { color: 'var(--color-teal)', borderBottom: '2px solid var(--color-teal)' }
              : { color: 'var(--color-text-faint)' }}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-faint)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]
                disabled:opacity-50 transition-all"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-faint)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]
                disabled:opacity-50 transition-all"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>

          {error && (
            <p className="text-xs rounded-xl px-3 py-2" style={{ color: 'var(--color-terracotta)', background: 'var(--color-terracotta-light)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--color-teal)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
