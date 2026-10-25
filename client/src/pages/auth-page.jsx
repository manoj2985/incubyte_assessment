import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function AuthPage() {
  const { user, authenticate } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/inventory" replace />;

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const values = mode === 'register' ? form : { email: form.email, password: form.password };
      await authenticate(mode, values);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rust font-display text-xl">A</span>
          <span className="font-semibold tracking-wide">AutoVault</span>
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Dealership inventory</p>
          <h1 className="font-display text-5xl leading-tight">Find the right car without the showroom runaround.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Live stock levels, clear pricing, and a straightforward purchase flow.</p>
        </div>
        <p className="text-sm text-slate-500">Inventory updates appear as soon as they are recorded.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rust font-display text-xl text-white">A</span>
            <span className="font-semibold">AutoVault</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rust">Welcome</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">{mode === 'login' ? 'Sign in to browse' : 'Create your account'}</h2>
          <p className="mt-3 text-stone-600">{mode === 'login' ? 'Use your account to see current inventory.' : 'Register to browse and purchase available vehicles.'}</p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            {mode === 'register' && <label><span className="label">Full name</span><input className="field" name="name" value={form.name} onChange={update} autoComplete="name" required /></label>}
            <label><span className="label">Email</span><input className="field" type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label>
            <label><span className="label">Password</span><input className="field" type="password" name="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" required /></label>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
            <button className="button-primary w-full" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            {mode === 'login' ? 'New to AutoVault?' : 'Already have an account?'}{' '}
            <button className="font-semibold text-rust hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

