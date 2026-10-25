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
    <main className="min-h-screen bg-[#f4f4f4] pt-12">
      <header className="fixed inset-x-0 top-0 z-10 flex h-12 items-center bg-[#161616] px-4 text-white">
        <span className="text-sm font-semibold">Roadline</span>
        <span className="ml-1 text-sm font-light text-[#c6c6c6]">Dealer Cloud</span>
        <span className="ml-auto text-xs text-[#a8a8a8]">Inventory management</span>
      </header>

      <div className="grid min-h-[calc(100vh-3rem)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-[#001141] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-40" aria-hidden="true">
            <div className="absolute -right-24 top-10 h-80 w-80 rotate-45 border-[52px] border-[#0f62fe]/50" />
            <div className="absolute bottom-16 left-1/3 h-72 w-px rotate-[32deg] bg-white/50" />
            <div className="absolute bottom-0 right-12 h-52 w-52 border-b-[40px] border-r-[40px] border-[#4589ff]/40" />
          </div>
          <p className="relative text-sm font-light text-[#a6c8ff]">ROADLINE / INVENTORY</p>
          <div className="relative max-w-xl">
            <p className="mb-5 text-sm text-[#78a9ff]">Dealership operations</p>
            <h1 className="text-5xl font-light leading-tight">Inventory control built for a faster showroom.</h1>
            <p className="mt-6 max-w-lg text-lg font-light leading-8 text-[#d0e2ff]">View live availability, manage stock, and keep every vehicle record in one place.</p>
          </div>
          <div className="relative grid grid-cols-3 border-l border-t border-white/30">
            <div className="border-b border-r border-white/30 p-4"><p className="text-xs text-[#a6c8ff]">Search</p><p className="mt-4 text-lg font-light">Live inventory</p></div>
            <div className="border-b border-r border-white/30 p-4"><p className="text-xs text-[#a6c8ff]">Purchase</p><p className="mt-4 text-lg font-light">Stock aware</p></div>
            <div className="border-b border-r border-white/30 p-4"><p className="text-xs text-[#a6c8ff]">Manage</p><p className="mt-4 text-lg font-light">Admin tools</p></div>
          </div>
      </section>

        <section className="flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-md">
            <p className="text-sm text-[#525252]">Welcome to Roadline</p>
            <h2 className="mt-3 text-4xl font-light">{mode === 'login' ? 'Sign in to browse' : 'Create your account'}</h2>
            <p className="mt-3 text-sm text-[#525252]">{mode === 'login' ? 'Use your account to see current inventory.' : 'Register to browse and purchase available vehicles.'}</p>

            <form className="mt-10 space-y-6" onSubmit={submit}>
              {mode === 'register' && <label><span className="label">Full name</span><input className="field" name="name" value={form.name} onChange={update} autoComplete="name" required /></label>}
              <label><span className="label">Email</span><input className="field" type="email" name="email" value={form.email} onChange={update} autoComplete="email" required /></label>
              <label><span className="label">Password</span><input className="field" type="password" name="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" required /></label>
              {error && <p className="border-l-4 border-[#da1e28] bg-[#fff1f1] px-4 py-3 text-sm text-[#a2191f]" role="alert">{error}</p>}
              <button className="button-primary w-full" disabled={submitting}><span>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</span><span aria-hidden="true">→</span></button>
            </form>

            <p className="mt-6 text-sm text-[#525252]">
              {mode === 'login' ? 'New to Roadline?' : 'Already have an account?'}{' '}
              <button className="text-[#0f62fe] hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

