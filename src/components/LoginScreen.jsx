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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#f8f7f4' }}>
      {/* Brand */}
      <div className="text-center mb-8">
        <span className="text-5xl">🤝</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-3">Touchbase</h1>
        <p className="text-gray-500 mt-1 text-sm">Stay connected after every meet</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Tab toggle */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === 'signin'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === 'signup'
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                disabled:opacity-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                disabled:opacity-50 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white
              rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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
