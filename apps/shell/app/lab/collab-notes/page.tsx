'use client'

import { useEffect, useState } from 'react'

type Role = 'viewer' | 'editor' | 'admin'
type User = { id: string; name: string; role: Role }

const USERS: User[] = [
  { id: 'u1', name: 'Alice (admin)', role: 'admin' },
  { id: 'u2', name: 'Bob (editor)', role: 'editor' },
  { id: 'u3', name: 'Carol (viewer)', role: 'viewer' },
]

function canEdit(role: Role) {
  return role === 'admin' || role === 'editor'
}
function canGrant(role: Role) {
  return role === 'admin'
}

export default function CollabNotesPage() {
  const [userId, setUserId] = useState('u1')
  const [note, setNote] = useState('')
  const [grantedEditors, setGrantedEditors] = useState<string[]>([])
  const [syncedAt, setSyncedAt] = useState<number | null>(null)

  const me = USERS.find((u) => u.id === userId)!
  const myEffectiveRole: Role = me.role === 'viewer' && grantedEditors.includes(me.id) ? 'editor' : me.role

  const saveNote = () => {
    setSyncedAt(Date.now())
  }

  const grant = (id: string) => {
    if (!canGrant(me.role)) return
    setGrantedEditors((g) => (g.includes(id) ? g : [...g, id]))
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Collaborative notes</h1>
        <p className="text-muted-foreground">
          Multi-user RBAC. Admin grants → viewer becomes editor. Verify via <em>context B</em>.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 flex gap-3 items-center">
        <span className="text-sm text-muted-foreground">Acting as:</span>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          effective: <strong>{myEffectiveRole}</strong>
        </span>
      </div>

      {canGrant(me.role) && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-2">Grant editor access</h3>
          <div className="flex gap-2">
            {USERS.filter((u) => u.role === 'viewer').map((u) => (
              <button
                key={u.id}
                onClick={() => grant(u.id)}
                disabled={grantedEditors.includes(u.id)}
                className="text-sm rounded-md border px-3 py-1.5 hover:bg-accent disabled:opacity-50"
              >
                {grantedEditors.includes(u.id) ? `✓ ${u.name} granted` : `Grant ${u.name}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold text-sm mb-2">Notes</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!canEdit(myEffectiveRole)}
          placeholder={canEdit(myEffectiveRole) ? 'Type notes here...' : 'Read-only for your role'}
          rows={6}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {syncedAt ? `Saved at ${new Date(syncedAt).toLocaleTimeString()}` : 'Unsaved'}
          </span>
          <button
            onClick={saveNote}
            disabled={!canEdit(myEffectiveRole)}
            className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
