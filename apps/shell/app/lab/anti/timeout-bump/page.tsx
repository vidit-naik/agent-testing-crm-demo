'use client'

import { useState } from 'react'
import { Paperclip, Save, Send } from 'lucide-react'

export default function DraftPage() {
  const [body, setBody] = useState('Following up on our call about the Q3 expansion. Pricing attached.')
  const [subject, setSubject] = useState('Q3 proposal review')
  const [toast, setToast] = useState<string | null>(null)
  const [attachments, setAttachments] = useState(['pricing-acme.pdf'])

  const sendNow = () => {
    setToast('Email queued for sending')
    setTimeout(() => setToast(null), 2400)
  }

  const saveDraft = () => {
    setToast('Draft saved')
    setTimeout(() => setToast(null), 2400)
  }

  const addAttachment = () => {
    setAttachments((current) => [...current, `attachment-${current.length + 1}.pdf`])
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Email compose</h1>
        <p className="text-muted-foreground">To: priya@acme.com</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-4 py-3 text-sm">
            <span className="text-muted-foreground">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full bg-transparent font-medium outline-none"
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full resize-none px-4 py-3 text-sm focus:outline-none"
          />
          <div className="flex items-center justify-between border-t px-4 py-3">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Save className="h-4 w-4" />
              Save draft
            </button>
            <button
              type="button"
              onClick={sendNow}
              disabled={!subject.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Attachments</h2>
            <div className="mt-3 space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{attachment}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttachment}
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Add attachment
            </button>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Delivery</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Recipient" value="Priya Ramanathan" />
              <Summary label="Account" value="ACME Corp" />
              <Summary label="Attachments" value={String(attachments.length)} />
            </div>
          </section>
        </aside>
      </div>

      {toast && (
        <div className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {toast}
        </div>
      )}
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
