"use client";

import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import Card from '@/components/Card';

type CrmUser = {id: string; email: string; name: string; role: 'sales' | 'superadmin'; isActive: boolean; password?: string; mfaSecret?: string};
type CrmUserPublic = {id: string; email: string; name: string; role: 'sales' | 'superadmin'; isActive: boolean; hasPassword?: boolean; hasMfaSecret?: boolean};
type CrmUserActivity = {id: number; actorEmail: string; actorRole: string; action: string; leadId: string; detail: string; createdAt: string};
type CrmLead = {id: string; assignedSalesUserId?: string | null};

type NewSalesUserDraft = {
  name: string;
  email: string;
  password: string;
};

const initialUserDraft: NewSalesUserDraft = {
  name: '',
  email: '',
  password: '',
};

export default function SalesUserManagementAdminClient({locale}: {locale: string}) {
  const isLv = locale === 'lv';
  const [crmUsers, setCrmUsers] = useState<CrmUserPublic[]>([]);
  const [activity, setActivity] = useState<CrmUserActivity[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [newUser, setNewUser] = useState<NewSalesUserDraft>(initialUserDraft);
  const [newUserTempPassword, setNewUserTempPassword] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [mfaDrafts, setMfaDrafts] = useState<Record<string, string>>({});
  const [passwordEditing, setPasswordEditing] = useState<Record<string, boolean>>({});
  const [mfaEditing, setMfaEditing] = useState<Record<string, boolean>>({});
  const [authCodeDrafts, setAuthCodeDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

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
      userPasswordHint: isLv ? 'Atstāj tukšu, lai ģenerētu drošu pagaidu paroli' : 'Leave empty to auto-generate a secure temporary password',
      passwordSaved: isLv ? 'Saglabāta parole' : 'Saved password',
      passwordUnset: isLv ? 'Nav iestatīta' : 'Not set',
      edit: isLv ? 'Rediģēt' : 'Edit',
      save: isLv ? 'Saglabāt' : 'Save',
      cancel: isLv ? 'Atcelt' : 'Cancel',
      authCode: isLv ? 'MFA apstiprinājums' : 'MFA confirmation',
      authCodePlaceholder: isLv ? '6 ciparu kods' : '6-digit code',
      authCodeHint: isLv ? 'Nepieciešams, lai mainītu jau saglabātu paroli vai MFA.' : 'Required to change an already saved password or MFA.',
      createUser: isLv ? 'Izveidot pārdevēju' : 'Create sales user',
      tempPassword: isLv ? 'Pagaidu parole' : 'Temporary password',
      dashboards: isLv ? 'Pārdevēju dashboard pārskats' : 'Sales dashboard overview',
      assignedLeads: isLv ? 'Piešķirtie līdi' : 'Assigned leads',
      activity: isLv ? 'Individuālie darba logi' : 'Individual work logs',
      noUsers: isLv ? 'Nav CRM lietotāju.' : 'No CRM users yet.',
      noActivity: isLv ? 'Aktivitātes vēl nav.' : 'No activity yet.',
      deactivate: isLv ? 'Deaktivēt' : 'Deactivate',
      activate: isLv ? 'Aktivēt' : 'Activate',
      remove: isLv ? 'Dzēst' : 'Delete',
      rename: isLv ? 'Mainīt vārdu' : 'Rename',
      dashboard: isLv ? 'Dashboard' : 'Dashboard',
      viewLeads: isLv ? 'Līdu pārvaldība' : 'Lead management',
    }),
    [isLv]
  );

  const loadCrmUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/users', {cache: 'no-store'});
      const data = await response.json();
      if (data?.ok && Array.isArray(data.users)) {
        const users = data.users.filter((entry: CrmUserPublic) => entry.role === 'sales');
        setCrmUsers(users);
        setPasswordDrafts(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, ''])));
        setMfaDrafts(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, ''])));
        setPasswordEditing(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, false])));
        setMfaEditing(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, false])));
        setAuthCodeDrafts(Object.fromEntries(users.map((user: CrmUserPublic) => [user.id, ''])));
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
      const data = await response.json();
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
      const data = await response.json();
      if (data?.ok && Array.isArray(data.activity)) {
        setActivity(data.activity);
      }
    } catch {
      setActivity([]);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadCrmUsers(), loadLeads()]);
  }, [loadCrmUsers, loadLeads]);

  useEffect(() => {
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
    setNewUserTempPassword('');

    try {
      const response = await fetch('/api/crm/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to create sales user');
      }

      setNewUser(initialUserDraft);
      setNewUserTempPassword(typeof data.temporaryPassword === 'string' ? data.temporaryPassword : '');
      setMessage(isLv ? 'Pārdevējs izveidots.' : 'Sales user created.');
      await Promise.all([loadCrmUsers(), loadActivity(selectedUserEmail || undefined)]);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to create sales user');
    } finally {
      setCreatingUser(false);
    }
  };

  const onUpdateUser = async (user: CrmUserPublic, patch: {name?: string; isActive?: boolean; password?: string; mfaSecret?: string; authCode?: string}) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      setMessage(isLv ? 'Lietotājs atjaunināts.' : 'User updated.');
      await loadCrmUsers();
      if (typeof patch.password === 'string') {
        setPasswordDrafts((current) => ({...current, [user.id]: ''}));
        setPasswordEditing((current) => ({...current, [user.id]: false}));
      }
      if (typeof patch.mfaSecret === 'string') {
        setMfaDrafts((current) => ({...current, [user.id]: ''}));
        setMfaEditing((current) => ({...current, [user.id]: false}));
      }
      if (typeof patch.authCode === 'string') {
        setAuthCodeDrafts((current) => ({...current, [user.id]: ''}));
      }
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update user');
    }
  };

  const onDeleteUser = async (user: CrmUserPublic) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/users/${encodeURIComponent(user.id)}`, {method: 'DELETE'});
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      setMessage(isLv ? 'Lietotājs dzēsts/deaktivēts.' : 'User deleted/deactivated.');
      await Promise.all([loadCrmUsers(), loadLeads(), loadActivity(selectedUserEmail || undefined)]);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to delete user');
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
            <input value={newUser.password} onChange={(e) => setNewUser((c) => ({...c, password: e.target.value}))} placeholder={labels.userPassword} className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <p className="text-xs text-slate-500">{labels.userPasswordHint}</p>
            <button type="submit" disabled={creatingUser} className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60">
              {creatingUser ? '...' : labels.createUser}
            </button>
          </form>

          {newUserTempPassword ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="font-semibold">{labels.tempPassword}: </span>{newUserTempPassword}
            </div>
          ) : null}

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
                            onClick={() => void onUpdateUser(user, {password: passwordDrafts[user.id] ?? '', authCode: authCodeDrafts[user.id] ?? ''})}
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
                        <p className="text-xs text-slate-500">{user.hasPassword ? labels.authCodeHint : labels.userPasswordHint}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{isLv ? 'MFA' : 'MFA'}</label>
                    {user.hasMfaSecret && !mfaEditing[user.id] ? (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-500">
                        <span>{isLv ? 'Saglabāts MFA' : 'Saved MFA'}: ••••••</span>
                        <button type="button" onClick={() => setMfaEditing((current) => ({...current, [user.id]: true}))} className="font-semibold text-sky-700">{labels.edit}</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={mfaDrafts[user.id] ?? ''}
                            onChange={(e) => setMfaDrafts((current) => ({...current, [user.id]: e.target.value.replace(/\D/g, '').slice(0, 6)}))}
                            className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-700"
                            placeholder={isLv ? 'Ievadi 6 ciparu MFA kodu' : 'Enter 6-digit MFA code'}
                            inputMode="numeric"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const generated = Math.floor(100000 + Math.random() * 900000).toString();
                              setMfaDrafts((current) => ({...current, [user.id]: generated}));
                              setMfaEditing((current) => ({...current, [user.id]: true}));
                            }}
                            className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700"
                          >
                            {isLv ? 'Ģenerēt' : 'Generate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void onUpdateUser(user, {mfaSecret: mfaDrafts[user.id] ?? '', authCode: authCodeDrafts[user.id] ?? ''})}
                            className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700"
                          >
                            {labels.save}
                          </button>
                          {user.hasMfaSecret ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMfaDrafts((current) => ({...current, [user.id]: ''}));
                                setMfaEditing((current) => ({...current, [user.id]: false}));
                              }}
                              className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-sky-700"
                            >
                              {labels.cancel}
                            </button>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">{isLv ? 'Ģenerētā vērtība ir 6 ciparu MFA kods.' : 'The generated value is a 6-digit MFA code.'}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{labels.authCode}</label>
                    <input
                      value={authCodeDrafts[user.id] ?? ''}
                      onChange={(e) => setAuthCodeDrafts((current) => ({...current, [user.id]: e.target.value.replace(/\D/g, '').slice(0, 6)}))}
                      className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-700"
                      placeholder={labels.authCodePlaceholder}
                      inputMode="numeric"
                      maxLength={6}
                    />
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
                    <button type="button" onClick={() => void onDeleteUser(user)} className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700">{labels.remove}</button>
                  </div>
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
