'use client'

import { useMemo, useState } from 'react'
import { Check, Lock, MessageSquare, Save, Send, Share2, Users } from 'lucide-react'

type Role = 'viewer' | 'editor' | 'admin'
type User = { id: string; name: string; role: Role; initials: string; color: string }
type Comment = { id: string; author: string; text: string; resolved: boolean }

const USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', role: 'admin', initials: 'AC', color: 'bg-blue-100 text-blue-800' },
  { id: 'u2', name: 'Bob Smith', role: 'editor', initials: 'BS', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'u3', name: 'Carol Ng', role: 'viewer', initials: 'CN', color: 'bg-amber-100 text-amber-800' },
  { id: 'u4', name: 'Maya Patel', role: 'editor', initials: 'MP', color: 'bg-rose-100 text-rose-800' },
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
    'ACME wants a pricing exception for Q3. Finance approved up to 12% discount if the customer signs a two-year term.\n\nNext step: send revised order form and confirm implementation timeline.'
  )
  const [grantedEditors, setGrantedEditors] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'deal-team' | 'private' | 'company'>('deal-team')
  const [syncedAt, setSyncedAt] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', author: 'Bob Smith', text: 'Finance asked for revised ARR impact before final approval.', resolved: false },
    { id: 'c2', author: 'Maya Patel', text: 'Customer prefers kickoff the week after signature.', resolved: true },
  ])

  const me = USERS.find((u) => u.id === userId)!
  const myEffectiveRole: Role =
    me.role === 'viewer' && grantedEditors.includes(me.id) ? 'editor' : me.role

  const activeUsers = useMemo(() => USERS.filter((user) => user.id !== userId).slice(0, 3), [userId])
  const unresolved = comments.filter((comment) => !comment.resolved).length

  const saveNote = () => {
    setSyncedAt(Date.now())
    setDirty(false)
  }

  const grant = (id: string) => {
    if (!canGrant(me.role)) return
    setGrantedEditors((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const addComment = () => {
    if (!commentDraft.trim()) return
    setComments((current) => [
      ...current,
      { id: `c${current.length + 1}`, author: me.name, text: commentDraft.trim(), resolved: false },
    ])
    setCommentDraft('')
  }

  const toggleResolved = (id: string) => {
    setComments((current) =>
      current.map((comment) => (comment.id === id ? { ...comment, resolved: !comment.resolved } : comment))
    )
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Users className="h-7 w-7 text-primary" />
            Shared deal notes
          </h1>
          <p className="text-muted-foreground">ACME Corp · Q3 expansion</p>
        </div>
        <div className="flex -space-x-2">
          {activeUsers.map((user) => (
            <div key={user.id} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-xs font-semibold ${user.color}`}>
              {user.initials}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Session</h2>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">User</span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm font-medium"
              >
                {USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Access</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">{myEffectiveRole}</span>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Sharing</h2>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            >
              <option value="deal-team">Deal team</option>
              <option value="private">Private</option>
              <option value="company">Company</option>
            </select>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              {visibility === 'private' ? <Lock className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              <span className="capitalize">{visibility.replace('-', ' ')}</span>
            </div>
          </section>

          {canGrant(me.role) && (
            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Collaborators</h2>
              <ul className="space-y-2">
                {USERS.filter((user) => user.id !== me.id).map((user) => {
                  const granted = grantedEditors.includes(user.id)
                  const effective = user.role === 'viewer' && granted ? 'editor' : user.role
                  return (
                    <li key={user.id} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${user.color}`}>
                        {user.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{effective}</div>
                      </div>
                      {user.role === 'viewer' && (
                        <button
                          type="button"
                          onClick={() => grant(user.id)}
                          className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                        >
                          {granted ? 'Revoke' : 'Grant'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </aside>

        <main className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Deal brief</h2>
              <span className="text-xs text-muted-foreground">
                {dirty ? 'Unsaved changes' : syncedAt ? `Saved ${new Date(syncedAt).toLocaleTimeString()}` : 'Ready'}
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setDirty(true)
              }}
              disabled={!canEdit(myEffectiveRole)}
              rows={14}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-slate-50 disabled:opacity-70"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={saveNote}
                disabled={!canEdit(myEffectiveRole) || !dirty}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Comments</h2>
            </div>
            <div className="space-y-3">
              {comments.map((comment) => (
                <article key={comment.id} className={`rounded-md border p-3 ${comment.resolved ? 'bg-muted/40' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{comment.author}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleResolved(comment.id)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
                    >
                      {comment.resolved && <Check className="h-3 w-3" />}
                      {comment.resolved ? 'Resolved' : 'Resolve'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addComment}
                disabled={!commentDraft.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Deal summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Value" value="$145,000" />
              <Summary label="Stage" value="Proposal" />
              <Summary label="Owner" value="Alice Chen" />
              <Summary label="Close date" value="June 28" />
              <Summary label="Comments" value={String(unresolved)} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Activity</h2>
            <div className="mt-3 space-y-3 text-sm">
              <Activity title="Finance approval" detail="Discount range approved" />
              <Activity title="Legal review" detail="Order form pending" />
              <Activity title="Implementation" detail="Kickoff window proposed" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function Activity({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground">{detail}</div>
    </div>
  )
}
