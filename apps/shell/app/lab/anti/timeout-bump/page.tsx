'use client'

import { useState } from 'react'
import { Send, Save } from 'lucide-react'

export default function DraftPage() {
  const [body, setBody] = useState('Following up on our call about the Q3 expansion. Pricing attached.')
  const [toast, setToast] = useState<string | null>(null)

  const sendNow = () => {
    setToast('Draft queued for sending')
    setTimeout(() => setToast(null), 2400)
  }

  const saveDraft = () => {
    setToast('Draft saved')
    setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Email compose</h1>
        <p className="text-muted-foreground">To: priya@acme.com · Re: Q3 proposal review</p>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="border-b px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Subject:</span>{' '}
          <span className="font-medium">Q3 proposal review</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
        />
        <div className="border-t px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={saveDraft}
            aria-label="Submit"
            data-primary="false"
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <button
            onClick={sendNow}
            data-testid="real-submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium inline-flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-md border bg-card px-4 py-2 text-sm shadow-sm inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {toast}
        </div>
      )}
    </div>
  )
}
