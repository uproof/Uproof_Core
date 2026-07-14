"use client";

import {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';

type StartResponse = {
  ok: boolean;
  alreadyConfigured?: boolean;
  enrollmentToken?: string;
  secret?: string;
  qrDataUrl?: string;
  otpauthUri?: string;
  issuer?: string;
  accountName?: string;
  error?: string;
};

type ConfirmResponse = {
  ok: boolean;
  recoveryCodes?: string[];
  error?: string;
};

type Props = {
  locale: string;
  scope: 'admin' | 'crm';
  backHref: string;
  title: string;
  subtitle: string;
  completedHref: string;
};

export default function MfaSetupPanel({locale, scope, backHref, title, subtitle, completedHref}: Props) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [alreadyConfigured, setAlreadyConfigured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const copy = useMemo(() => {
    if (locale === 'en') {
      return {
        label: 'Authenticator setup',
        start: 'Create setup',
        secret: 'Manual key',
        code: 'CODE',
        confirm: 'Confirm authenticator',
        recoveryTitle: 'Recovery codes',
        recoveryHint: 'Save these now. Each code works once.',
        copy: 'Copy',
        print: 'Print / Save PDF',
        download: 'Download TXT',
        done: 'Authenticator enrolled.',
        already: 'Authenticator is already configured for this account.',
        next: 'Continue',
      };
    }

    if (locale === 'nl-BE') {
      return {
        label: 'Authenticator instellen',
        start: 'Setup starten',
        secret: 'Handmatige sleutel',
        code: 'CODE',
        confirm: 'Authenticator bevestigen',
        recoveryTitle: 'Herstelcodes',
        recoveryHint: 'Bewaar deze nu. Elke code werkt één keer.',
        copy: 'Kopiëren',
        print: 'Afdrukken / Opslaan als PDF',
        download: 'TXT downloaden',
        done: 'Authenticator toegevoegd.',
        already: 'Authenticator is al ingesteld voor dit account.',
        next: 'Verdergaan',
      };
    }

    return {
      label: 'Autentifikatora iestatīšana',
      start: 'Sākt iestatīšanu',
      secret: 'Manuālā atslēga',
      code: 'CODE',
      confirm: 'Apstiprināt autentifikatoru',
      recoveryTitle: 'Atjaunošanas kodi',
      recoveryHint: 'Saglabā tos tagad. Katrs kods darbojas vienu reizi.',
      copy: 'Kopēt',
      print: 'Drukāt / Saglabāt PDF',
      download: 'Lejupielādēt TXT',
      done: 'Autentifikators pievienots.',
      already: 'Šim kontam autentifikators jau ir iestatīts.',
      next: 'Turpināt',
    };
  }, [locale]);

  useEffect(() => {
    void startEnrollment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnrollment = async (forceReset = false) => {
    setLoading(true);
    setMessage('');
    setRecoveryCodes([]);
    setAlreadyConfigured(false);

    try {
      const response = await fetch('/api/security/mfa/setup/start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({scope, forceReset}),
      });
      const data = (await response.json()) as StartResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to start authenticator setup');
      }

      if (data.alreadyConfigured) {
        setAlreadyConfigured(true);
        return;
      }

      setToken(data.enrollmentToken || '');
      setSecret(data.secret || '');
      setQrDataUrl(data.qrDataUrl || '');
      setOtpauthUri(data.otpauthUri || '');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to start authenticator setup');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndStart = async () => {
    setResetting(true);
    try {
      await startEnrollment(true);
    } finally {
      setResetting(false);
    }
  };

  const confirmEnrollment = async () => {
    if (!token || !code.trim()) {
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/security/mfa/setup/confirm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({scope, enrollmentToken: token, code}),
      });
      const data = (await response.json()) as ConfirmResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Unable to confirm authenticator');
      }

      setRecoveryCodes(data.recoveryCodes || []);
      setMessage(copy.done);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to confirm authenticator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!recoveryCodes.length) return;
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setMessage(locale === 'en' ? 'Recovery codes copied.' : locale === 'nl-BE' ? 'Herstelcodes gekopieerd.' : 'Atjaunošanas kodi nokopēti.');
  };

  const handleDownload = () => {
    if (!recoveryCodes.length) return;
    const blob = new Blob([recoveryCodes.join('\n')], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scope}-recovery-codes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7fd_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sm font-bold text-sky-700 ring-1 ring-sky-100">U</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">UpRoof</p>
              <p className="text-sm text-slate-500">Authenticator setup</p>
            </div>
          </div>
          <a href={backHref} className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
            {copy.next}
          </a>
        </div>

        <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{copy.label}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
          </div>

          {loading ? <p className="mt-6 text-sm text-slate-500">{copy.start}...</p> : null}
          {message ? <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">{message}</div> : null}

          {alreadyConfigured ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-base font-semibold text-emerald-900">{copy.already}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleResetAndStart()}
                  disabled={loading || resetting}
                  className="inline-flex rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {resetting ? '...' : 'Reset and set up new'}
                </button>
                <a href={completedHref} className="inline-flex rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                  {copy.next}
                </a>
              </div>
            </div>
          ) : null}

          {!loading && !alreadyConfigured && token ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-sky-100 bg-slate-50 p-4 text-slate-900 shadow-sm print:border-slate-300 print:shadow-none">
                {qrDataUrl ? <Image src={qrDataUrl} alt="Authenticator QR code" width={260} height={260} unoptimized className="mx-auto h-auto w-full max-w-[260px] rounded-2xl bg-white p-2 shadow-sm ring-1 ring-sky-100" /> : null}
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-sky-700">{copy.secret}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <code className="rounded-2xl border border-sky-100 bg-slate-50 px-3 py-2 text-sm text-slate-900">{secret}</code>
                  </div>
                </div>

                <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
                  <label className="block text-sm font-semibold text-sky-700">{copy.code}</label>
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="mt-3 w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={() => void confirmEnrollment()}
                    disabled={submitting}
                    className="mt-4 inline-flex rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
                  >
                    {submitting ? '...' : copy.confirm}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {recoveryCodes.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-slate-900 print:border-slate-300 print:bg-white print:text-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-amber-900">{copy.recoveryTitle}</p>
                  <p className="mt-1 text-sm text-amber-800 print:text-slate-600">{copy.recoveryHint}</p>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <button type="button" onClick={() => void handleCopy()} className="rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800">
                    {copy.copy}
                  </button>
                  <button type="button" onClick={handlePrint} className="rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800">
                    {copy.print}
                  </button>
                  <button type="button" onClick={handleDownload} className="rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800">
                    {copy.download}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
                {recoveryCodes.map((item) => (
                  <div key={item} className="rounded-2xl border border-amber-100 bg-white px-3 py-2 font-mono text-sm tracking-[0.14em] text-slate-900 print:border-slate-300 print:bg-white print:text-slate-900">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}