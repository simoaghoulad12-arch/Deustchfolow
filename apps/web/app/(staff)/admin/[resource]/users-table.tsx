'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/live/ui';
import { setRoleAction } from '../actions';

type U = { id: string; email: string; role: string; createdAt: string; profile: { displayName: string | null } | null; learningProfile: { targetLanguageCode: string | null; currentLevel: string | null } | null };

const ROLES = ['STUDENT', 'TUTOR', 'CONTENT_EDITOR', 'SUPPORT', 'ADMIN'];

function Row({ u, self }: { u: U; self: boolean }) {
  const [role, setRole] = useState(u.role);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <tr>
      <td className="px-4 py-2.5">
        <p className="font-medium">{u.email}</p>
        <p className="text-xs text-muted-foreground">{u.profile?.displayName ?? ''}</p>
      </td>
      <td className="px-4 py-2.5">{u.learningProfile?.targetLanguageCode ? `${u.learningProfile.targetLanguageCode} · ${u.learningProfile.currentLevel ?? '?'}` : '–'}</td>
      <td className="px-4 py-2.5">{new Date(u.createdAt).toLocaleDateString('en')}</td>
      <td className="px-4 py-2.5">
        <select
          aria-label={`Role of ${u.email}`}
          value={role}
          disabled={self || pending}
          onChange={(e) => {
            const next = e.target.value;
            start(async () => {
              const res = await setRoleAction(u.id, next);
              if (res.ok) {
                setRole(next);
                setMsg('Saved');
              } else setMsg(res.message);
            });
          }}
          className="h-9 rounded-lg border border-border bg-white px-2"
        >
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        {msg && <span className="ml-2 text-xs text-muted-foreground">{msg}</span>}
      </td>
    </tr>
  );
}

export function UsersTable({ users, selfId }: { users: U[]; selfId: string }) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Learning</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <Row key={u.id} u={u} self={u.id === selfId} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
