"use client";

import {FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import Card from '@/components/Card';

type CrmUserPublic = {id: string; email: string; name: string; role: 'sales' | 'superadmin'; isActive: boolean; hasPassword?: boolean};
type CrmUserActivity = {id: number; actorEmail: string; actorRole: string; action: string; leadId: string; detail: string; createdAt: string};
type CrmLead = {id: string; assignedSalesUserId?: string | null; createdAt?: string; createdAtUtc?: string};

type NewSalesUserDraft = {
  name: string;
  email: string;
  password: string;
};

async function readResponseJson(response: Response) {
  const text = await response.text().catch(() => '');
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {ok: false, error: text};
  }
}

const initialUserDraft: NewSalesUserDraft = {
  name: '',
  email: '',
  password: '',
};

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return '—';
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return '—';
  }

  const deltaMs = Date.now() - timestamp;
  const absoluteSeconds = Math.max(0, Math.round(Math.abs(deltaMs) / 1000));

  if (absoluteSeconds < 60) return `${absoluteSeconds}s ago`;

  const minutes = Math.floor(absoluteSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatCallDuration(detail: string) {
  const normalized = detail.trim();
  if (!normalized) {
    return '—';
  }

  const match = normalized.match(/(?:call\s*duration|duration)\s*[:=]?\s*(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes)?/i);
  if (!match) {
    return '—';
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return '—';
  }

  const unit = (match[2] || 'm').toLowerCase();
  if (unit.startsWith('s')) {
    return `${amount}s`;
  }

  return `${amount}m`;
}

export default function SalesUserManagementAdminClient({
  locale,
  initialCrmUsers = [],
  initialLeads = [],
  initialActivity = [],
}: {
  locale: string;
  initialCrmUsers?: CrmUserPublic[];
  initialLeads?: CrmLead[];
  initialActivity?: CrmUserActivity[];
}) {
  const isLv = locale === 'lv';
  const [crmUsers, setCrmUsers] = useState<CrmUserPublic[]>(initialCrmUsers);
  const [activity, setActivity] = useState<CrmUserActivity[]>(initialActivity);
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [selectedUserEmail, setSelectedUserEmail] = useState(initialCrmUsers[0]?.email || '');
  const [newUser, setNewUser] = useState<NewSalesUserDraft>(initialUserDraft);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [passwordEditing, setPasswordEditing] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [securityMessages, setSecurityMessages] = useState<Record<string, string>>({});
  const [creatingUser, setCreatingUser] = useState(false);
  const isFirstActivityRender = useRef(true);
  const leadMap = useMemo(() => new Map(leads.map((lead) => [lead.id.trim().toLowerCase(), lead])), [leads]);

  const labels = useMemo(
    () => ({
      title: isLv ? 'Pārdevēju lietotāju pārvaldība' : 'Sales User Management',
      subtitle: isLv
        ? 'Izveido, deaktivē un pārvaldi pārdevēju piekļuvi, aktivitātes un dashboardus.'
        : 'Create, deactivate, and manage sales user access, logs, and dashboards.',
      back: isLv ? 'Atpakaļ uz CMS' : 'Back to CMS',
      users: isLv ? 'CRM lietotāji' : 'CRM users',
      usersSubtitle: isLv ? 'Invite-only: izveido pārdevēju kontu' : 'Invite-only: create a sales account',
      userName: isLv ? 'Vārds' : 'Name',
      userEmail: isLv ? 'E-pasts' : 'Email',
      userPassword: isLv ? 'Parole' : 'Password',
      userPasswordHint: isLv ? 'Parolei jābūt vismaz 8 rakstzīmēm ar lielo burtu, ciparu un speciālu simbolu.' : 'Password must be at least 8 characters with one uppercase letter, one number, and one special symbol.',
      passwordSaved: isLv ? 'Saglabāta parole' : 'Saved password',
      passwordUnset: isLv ? 'Nav iestatīta' : 'Not set',
      edit: isLv ? 'Rediģēt' : 'Edit',
      save: isLv ? 'Saglabāt' : 'Save',
      cancel: isLv ? 'Atcelt' : 'Cancel',
      passwordNote: isLv ? 'Lai atiestatītu vai atjauninātu paroli, ievadi jaunu vērtību un spied Saglabāt.' : 'To reset or update the password, enter a new value and click Save.',
      createUser: isLv ? 'Izveidot pārdevēju' : 'Create sales user',
      dashboards: isLv ? 'Pārdevēju dashboard pārskats' : 'Sales dashboard overview',
      assignedLeads: isLv ? 'Piešķirtie līdi' : 'Assigned leads',
      activity: isLv ? 'Individuālie darba logi' : 'Individual work logs',
      noUsers: isLv ? 'Nav CRM lietotāju.' : 'No CRM users yet.',
      noActivity: isLv ? 'Aktivitātes vēl nav.' : 'No activity yet.',
      deactivate: isLv ? 'Deaktivēt' : 'Deactivate',
      activate: isLv ? 'Aktivēt' : 'Activate',
      remove: isLv ? 'Dzēst' : 'Delete',
      archive: isLv ? 'Arhivēt' : 'Archive',
      rename: isLv ? 'Mainīt vārdu' : 'Rename',
      dashboard: isLv ? 'Dashboard' : 'Dashboard',
      viewLeads: isLv ? 'Līdu pārvaldība' : 'Lead management',
      revokeSessions: isLv ? 'Atsaukt piekļuvi' : 'Revoke access',
      disableAccount: isLv ? 'Atspējot piekļuvi' : 'Disable access',
      deleteUser: isLv ? 'Dzēst lietotāju' : 'Delete user',
    }),
    [isLv]
  );

  const loadCrmUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/users', {cache: 'no-store'});
      const data = await readResponseJson(response);
      if (data?.ok && Array.isArray(data.users)) {
        const users = data.users.filter((entry: CrmUserPublic) => entry.role === 'sales');
        setCrmUsers(users);
        setPasswordDrafts(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, ''])));
        setPasswordEditing(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, false])));
        if (!selectedUserEmail && users.length > 0) {
          setSelectedUserEmail(users[0].email);
        }
      }
    } catch {
      setCrmUsers([]);
    }
  }, [selectedUserEmail]);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/leads', {cache: 'no-store'});
      const data = await readResponseJson(response);
      if (data?.ok && Array.isArray(data.leads)) {
        setLeads(data.leads as CrmLead[]);
      }
    } catch {
      setLeads([]);
    }
  }, []);

  const loadActivity = useCallback(async (email?: string) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : '';
      const response = await fetch(`/api/crm/users/activity${query}`, {cache: 'no-store'});
      const data = await readResponseJson(response);
      if (data?.ok && Array.isArray(data.activity)) {
        setActivity(data.activity);
      }
    } catch {
      setActivity([]);
    }
  }, []);

  useEffect(() => {
    if (isFirstActivityRender.current) {
      isFirstActivityRender.current = false;
      return;
    }

    if (!selectedUserEmail) {
      setActivity([]);
      return;
    }

    void loadActivity(selectedUserEmail);
  }, [loadActivity, selectedUserEmail]);

  const userLeadCount = crmUsers.reduce<Record<string, number>>((acc, user) => {
    acc[user.id] = leads.filter((lead) => lead.assignedSalesUserId === user.id).length;
    return acc;
  }, {});

  const onCreateSalesUser = async (event: FormEvent) => {
    event.preventDefault();
    setCreatingUser(true);
    setMessage('');

    try {
      const response = await fetch('/api/crm/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser),
      });
      const data = await readResponseJson(response);
      if (!data?.ok) {
        throw new Error(data.error || 'Failed to create sales user');
      }

      setNewUser(initialUserDraft);
      setMessage(isLv ? 'Pārdevējs izveidots.' : 'Sales user created.');
      await Promise.all([loadCrmUsers(), loadActivity(selectedUserEmail || undefined)]);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to create sales user');
    } finally {
      setCreatingUser(false);
    }
  };

  const onUpdateUser = async (user: CrmUserPublic, patch: {name?: string; isActive?: boolean; password?: string}) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(patch),
      });
      const data = await readResponseJson(response);
      if (!data?.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      if (data.logoutRequired) {
        window.location.assign(`/${locale}/admin/login`);
        return;
      }
      setMessage(isLv ? 'Lietotājs atjaunināts.' : 'User updated.');
      await loadCrmUsers();
      if (typeof patch.password === 'string') {
        setPasswordDrafts((current) => ({...current, [user.id]: ''}));
        setPasswordEditing((current) => ({...current, [user.id]: false}));
      }
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update user');
    }
  };

  const onDeleteUser = async (user: CrmUserPublic) => {
    if (!window.confirm(isLv ? `Dzēst lietotāju ${user.name}? Pēc tam kontu vairs nevar atjaunot.` : `Delete ${user.name}? This cannot be undone.`)) {
      return;
    }

    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'delete-user'}),
      });
      const data = await readResponseJson(response);
      if (!data?.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      setMessage(isLv ? 'Lietotājs dzēsts un dati saglabāti vēsturē.' : 'User deleted and data preserved in history.');
      await Promise.all([loadCrmUsers(), loadLeads(), loadActivity(selectedUserEmail || undefined)]);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to delete user');
    }
  };

  const onExportUserData = async (user: CrmUserPublic) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'export-user-data'}),
      });
      const data = await readResponseJson(response);
      if (!data.ok || !data.payload) {
        throw new Error(data.error || 'Failed to export user data');
      }

      const blob = new Blob([JSON.stringify(data.payload, null, 2)], {type: 'application/json;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.email.replace(/[^a-z0-9._-]+/gi, '_')}-export.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage(isLv ? 'Dati lejupielādēti.' : 'Data exported.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to export user data');
    }
  };

  const onSecurityAction = async (user: CrmUserPublic, action: string, payload: Record<string, unknown> = {}) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}/security`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action, locale, ...payload}),
      });
      const data = await readResponseJson(response);
      if (!data?.ok) {
        throw new Error(data.error || 'Security action failed');
      }

      if (action === 'reset-password') {
        if (data.resetLink) {
          void navigator.clipboard?.writeText(String(data.resetLink)).catch(() => {});
        }
        setSecurityMessages((current) => ({
          ...current,
          [user.id]: data.resetLink
            ? `${isLv ? 'Paroles atiestatīšanas saite:' : 'Password reset link:'} ${data.resetLink}`
            : (isLv ? 'Paroles atiestatīšanas saite ir sagatavota un jānogādā drošā kanālā.' : 'Password reset link prepared and must be delivered through a secure channel.'),
        }));
      } else {
        setSecurityMessages((current) => ({
          ...current,
          [user.id]: isLv ? 'Drošības darbība pabeigta.' : 'Security action completed.',
        }));
      }

      await Promise.all([loadCrmUsers(), loadLeads(), loadActivity(selectedUserEmail || undefined)]);
    } catch (error: any) {
      setMessage(error?.message || 'Security action failed');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{labels.title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{labels.subtitle}</h2>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/admin/crm/leads`} className="inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
            {labels.viewLeads}
          </Link>
          <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
            {labels.back}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
          <p className="text-sm font-semibold text-sky-600">{labels.users}</p>
          <p className="mt-1 text-xs text-slate-500">{labels.usersSubtitle}</p>

          <form onSubmit={onCreateSalesUser} className="mt-3 grid gap-2">
            <input value={newUser.name} onChange={(e) => setNewUser((c) => ({...c, name: e.target.value}))} placeholder={labels.userName} className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm" required />
            <input value={newUser.email} onChange={(e) => setNewUser((c) => ({...c, email: e.target.value}))} placeholder={labels.userEmail} type="email" className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm" required />
            <input value={newUser.password} onChange={(e) => setNewUser((c) => ({...c, password: e.target.value}))} placeholder={labels.userPassword} className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm" required />
            <p className="text-xs text-slate-500">{labels.userPasswordHint}</p>
            <button type="submit" disabled={creatingUser} className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60">
              {creatingUser ? '...' : labels.createUser}
            </button>
          </form>

          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}

          <div className="mt-3 space-y-2">
            {crmUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-500">{labels.noUsers}</div>
            ) : (
              crmUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div>{user.email}</div>
                  <div className="mt-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isLv ? 'Parole' : 'Password'}</label>
                    {user.hasPassword && !passwordEditing[user.id] ? (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-500">
                        <span>{labels.passwordSaved}: ••••••••</span>
                        <button type="button" onClick={() => setPasswordEditing((current) => ({...current, [user.id]: true}))} className="font-semibold text-sky-700">{labels.edit}</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={passwordDrafts[user.id] ?? ''}
                            onChange={(e) => setPasswordDrafts((current) => ({...current, [user.id]: e.target.value}))}
                            className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-700"
                            placeholder={user.hasPassword ? (isLv ? 'Ievadi jauno paroli' : 'Enter new password') : (isLv ? 'Iestati paroli' : 'Set password')}
                          />
                          <button
                            type="button"
                            onClick={() => void onUpdateUser(user, {password: passwordDrafts[user.id] ?? ''})}
                            className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700"
                          >
                            {labels.save}
                          </button>
                          {user.hasPassword ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordDrafts((current) => ({...current, [user.id]: ''}));
                                setPasswordEditing((current) => ({...current, [user.id]: false}));
                              }}
                              className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700"
                            >
                              {labels.cancel}
                            </button>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">{labels.userPasswordHint}</p>
                        <p className="text-xs text-slate-500">{labels.passwordNote}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{labels.assignedLeads}: {userLeadCount[user.id] || 0}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/${locale}/admin/crm/users/${encodeURIComponent(user.id)}`} className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700">{labels.dashboard}</Link>
                    <button type="button" onClick={() => {
                      const nextName = window.prompt(labels.rename, user.name);
                      if (nextName && nextName.trim()) {
                        void onUpdateUser(user, {name: nextName.trim()});
                      }
                    }} className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700">{labels.rename}</button>
                    <button type="button" onClick={() => void onUpdateUser(user, {isActive: !user.isActive})} className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700">{user.isActive ? labels.deactivate : labels.activate}</button>
                    <button type="button" onClick={() => void onSecurityAction(user, 'revoke-sessions')} className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs text-amber-700">{labels.revokeSessions}</button>
                    <button type="button" onClick={() => void onExportUserData(user)} className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700">{isLv ? 'Lejupielādēt datus' : 'Download data'}</button>
                    <button type="button" onClick={() => void onSecurityAction(user, 'disable-account')} className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700">{labels.disableAccount}</button>
                    <button type="button" onClick={() => void onDeleteUser(user)} className="rounded-lg border border-rose-300 bg-white px-2 py-1 text-xs text-rose-800">{labels.deleteUser}</button>
                  </div>
                  {securityMessages[user.id] ? <p className="mt-2 text-xs text-slate-500">{securityMessages[user.id]}</p> : null}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
          <p className="text-sm font-semibold text-sky-600">{labels.activity}</p>
          <div className="mt-2">
            <select value={selectedUserEmail} onChange={(e) => setSelectedUserEmail(e.target.value)} className="h-10 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm text-slate-700">
              <option value="">All sales users</option>
              {crmUsers.map((user) => (
                <option key={user.id} value={user.email}>{user.name} · {user.email}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 space-y-2 max-h-[560px] overflow-auto pr-1">
            {activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-500">{labels.noActivity}</div>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-xs text-slate-600">
                  <div className="font-semibold text-slate-900">{entry.actorEmail}</div>
                  <div>{entry.action}{entry.leadId ? ` · ${entry.leadId}` : ''}</div>
                  <div className="mt-1 flex flex-wrap gap-3 text-slate-500">
                    <span>Lead added: {formatRelativeTime(leadMap.get(entry.leadId.trim().toLowerCase())?.createdAtUtc || leadMap.get(entry.leadId.trim().toLowerCase())?.createdAt)}</span>
                    <span>Response: {formatRelativeTime(entry.createdAt)}</span>
                    <span>Call duration: {formatCallDuration(entry.detail || '')}</span>
                  </div>
                  <div>{entry.detail || '—'}</div>
                  <div className="text-slate-500">{new Date(entry.createdAt).toLocaleString('en-GB')}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
