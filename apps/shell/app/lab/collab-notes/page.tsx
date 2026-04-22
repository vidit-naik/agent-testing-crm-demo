'use client'

import { useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

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
  const myEffectiveRole: Role =
    me.role === 'viewer' && grantedEditors.includes(me.id) ? 'editor' : me.role

  const saveNote = () => {
    setSyncedAt(Date.now())
  }

  const grant = (id: string) => {
    if (!canGrant(me.role)) return
    setGrantedEditors((g) => (g.includes(id) ? g : [...g, id]))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborative notes"
        subtitle="RBAC verification. Admin grants viewer → editor; test must swap identity to verify the promotion took effect."
        route="/lab/collab-notes"
        patterns={['RBAC', 'multi-user', 'identity swap']}
      />

      <ScenarioPanel
        story={
          <>
            Alice (admin) grants Carol (viewer) edit access to a shared note. Carol should now be
            able to type. The page lets you simulate both users via the <em>Acting as</em> switcher.
          </>
        }
        steps={[
          'Act as Alice (admin)',
          'Grant Carol edit access',
          'Switch acting user → Carol',
          'Confirm the textarea is no longer disabled',
          'Type something, click Save, assert the save timestamp',
        ]}
        success={[
          'Test switches user context at least once within the same spec.',
          <>
            After grant, Carol&apos;s effective role resolves to{' '}
            <code className="font-mono text-xs">editor</code>.
          </>,
          'Write succeeds for Carol and is asserted via the save timestamp.',
        ]}
        gotcha={
          <>
            Single-context healers never swap identity. They see Carol-as-viewer, hit a disabled
            textarea, and blame the selector. The fix is a context/identity swap, not a selector.
          </>
        }
      />

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4 flex gap-3 items-center flex-wrap">
          <span className="text-sm font-medium">Acting as:</span>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            data-testid="user-switcher"
          >
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <span
            className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono"
            data-effective-role={myEffectiveRole}
          >
            effective: {myEffectiveRole}
          </span>
          {grantedEditors.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Granted: {grantedEditors.join(', ')}
            </span>
          )}
        </div>

        {canGrant(me.role) && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-sm mb-2">Grant editor access</h3>
            <div className="flex gap-2 flex-wrap">
              {USERS.filter((u) => u.role === 'viewer').map((u) => (
                <button
                  key={u.id}
                  onClick={() => grant(u.id)}
                  disabled={grantedEditors.includes(u.id)}
                  className="text-sm rounded-md border px-3 py-1.5 hover:bg-accent disabled:opacity-50"
                  data-testid={`grant-${u.id}`}
                >
                  {grantedEditors.includes(u.id) ? `✓ ${u.name} granted` : `Grant ${u.name}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm mb-2">Deal notes</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!canEdit(myEffectiveRole)}
            placeholder={
              canEdit(myEffectiveRole)
                ? 'Type notes here — will sync to all users with access'
                : 'Read-only for your role'
            }
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
            data-testid="note-input"
          />
          <div className="flex items-center justify-between mt-2">
            <span
              className="text-xs text-muted-foreground"
              data-synced-at={syncedAt ?? ''}
            >
              {syncedAt ? `Saved at ${new Date(syncedAt).toLocaleTimeString()}` : 'Unsaved'}
            </span>
            <button
              onClick={saveNote}
              disabled={!canEdit(myEffectiveRole)}
              className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
              data-testid="save-note"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
