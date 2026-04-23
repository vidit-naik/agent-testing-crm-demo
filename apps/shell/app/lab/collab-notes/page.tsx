'use client'

import { useState } from 'react'
import { Users, Check, Save } from 'lucide-react'

type Role = 'viewer' | 'editor' | 'admin'
type User = { id: string; name: string; role: Role; initials: string }

const USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', role: 'admin', initials: 'AC' },
  { id: 'u2', name: 'Bob Smith', role: 'editor', initials: 'BS' },
  { id: 'u3', name: 'Carol Ng', role: 'viewer', initials: 'CN' },
]

function canEdit(role: Role) {
  return role === 'admin' || role === 'editor'
}
function canGrant(role: Role) {
  return role === 'admin'
}

export default function SharedNotesPage() {
  const [userId, setUserId] = useState('u1')
  const [note, setNote] = useState(
    'ACME wants a pricing exception for Q3. Flagged with finance on Apr 18.'
  )
  const [grantedEditors, setGrantedEditors] = useState<string[]>([])
  const [syncedAt, setSyncedAt] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)

  const me = USERS.find((u) => u.id === userId)!
  const myEffectiveRole: Role =
    me.role === 'viewer' && grantedEditors.includes(me.id) ? 'editor' : me.role

  const saveNote = () => {
    setSyncedAt(Date.now())
    setDirty(false)
  }

  const grant = (id: string) => {
    if (!canGrant(me.role)) return
    setGrantedEditors((g) => (g.includes(id) ? g : [...g, id]))
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          Shared deal notes
        </h1>
        <p className="text-muted-foreground">ACME Corp · Q3 expansion</p>
      </div>

      <div className="rounded-lg border bg-card p-4 flex gap-3 items-center flex-wrap">
        <span className="text-sm text-muted-foreground">You are signed in as</span>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm font-medium"
          data-testid="user-switcher"
        >
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <span
          className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700"
          data-effective-role={myEffectiveRole}
        >
          effective: {myEffectiveRole}
        </span>
      </div>

      {canGrant(me.role) && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Collaborators</h3>
            <span className="text-xs text-muted-foreground">Admin only</span>
          </div>
          <ul className="space-y-1.5">
            {USERS.filter((u) => u.id !== me.id).map((u) => {
              const granted = grantedEditors.includes(u.id)
              const effRole = u.role === 'viewer' && granted ? 'editor' : u.role
              return (
                <li key={u.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {u.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {effRole}
                      {granted && ' (granted)'}
                    </div>
                  </div>
                  {u.role === 'viewer' && (
                    <button
                      onClick={() => grant(u.id)}
                      disabled={granted}
                      className="text-xs rounded-md border px-2.5 py-1 hover:bg-accent disabled:opacity-50 inline-flex items-center gap-1"
                      data-testid={`grant-${u.id}`}
                    >
                      {granted ? (
                        <>
                          <Check className="h-3 w-3" />
                          Editor
                        </>
                      ) : (
                        'Grant edit'
                      )}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Note</h3>
          <span className="text-xs text-muted-foreground" data-synced-at={syncedAt ?? ''}>
            {dirty
              ? 'Unsaved changes'
              : syncedAt
              ? `Saved · ${new Date(syncedAt).toLocaleTimeString()}`
              : 'No changes'}
          </span>
        </div>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setDirty(true)
          }}
          disabled={!canEdit(myEffectiveRole)}
          placeholder={
            canEdit(myEffectiveRole) ? 'Start typing...' : 'You have read-only access'
          }
          rows={6}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60 disabled:bg-slate-50"
          data-testid="note-input"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={saveNote}
            disabled={!canEdit(myEffectiveRole) || !dirty}
            className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
            data-testid="save-note"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
