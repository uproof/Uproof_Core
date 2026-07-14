"use client";

import {useState} from 'react';

type Props = {
  locale: string;
  redirectTarget: string;
};

export default function AdminLoginPage({locale, redirectTarget}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const labels = locale === 'nl-BE'
    ? {
        heading: 'CMS aanmelding',
        title: 'Meld je aan als superadmin',
        email: 'E-mail',
        password: 'Wachtwoord',
        button: 'Doorgaan',
      }
    : locale === 'lv'
      ? {
          heading: 'CMS pieteikšanās',
          title: 'Pieslēgties kā superadmin',
          email: 'E-pasts',
          password: 'Parole',
          button: 'Turpināt',
        }
      : {
          heading: 'CMS sign in',
          title: 'Sign in',
          email: 'Email',
          password: 'Password',
          button: 'Continue',
        };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, role: 'superadmin'}),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Login failed');
      }

      window.location.assign(redirectTarget);
    } catch (error: any) {
      setMessage(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#f8fcff_0%,#eef7fd_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">{labels.heading}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{labels.title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">Use your approved CMS account to continue.</p>
          </div>

          <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)] sm:p-8">
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div>
                <label className="block text-sm font-semibold text-slate-700">{labels.email}</label>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">{labels.password}</label>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="mt-2 w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
              </div>
              {message ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? '...' : labels.button}
              </button>
            </form>

            <p className="mt-4 text-xs leading-5 text-slate-500">Use your approved CMS email and password to continue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}