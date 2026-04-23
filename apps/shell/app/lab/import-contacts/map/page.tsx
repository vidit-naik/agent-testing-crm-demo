'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import {
  IMPORT_STEPS,
  IMPORT_DEFAULT,
  CRM_FIELDS,
  type ImportState,
} from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

function autoGuess(headers: string[]) {
  const map: Record<string, string> = {}
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
  const index = new Map(headers.map((h) => [norm(h), h]))
  const guess = (keys: string[]) => {
    for (const k of keys) {
      const m = index.get(norm(k))
      if (m) return m
    }
    return ''
  }
  map.firstName = guess(['first name', 'firstname', 'given name'])
  map.lastName = guess(['last name', 'lastname', 'surname', 'family name'])
  map.email = guess(['email', 'emailaddress', 'email address'])
  map.phone = guess(['phone', 'mobile', 'telephone'])
  map.company = guess(['company', 'organization', 'org', 'account'])
  map.title = guess(['title', 'role', 'jobtitle', 'position'])
  return map
}

export default function MapStep() {
  const router = useRouter()
  const [state, setState] = useState<ImportState>(IMPORT_DEFAULT)

  useEffect(() => {
    const loaded = getWizard('import', IMPORT_DEFAULT)
    if (!loaded.fileName) {
      router.replace('/lab/import-contacts/upload')
      return
    }
    if (Object.keys(loaded.mapping).length === 0) {
      loaded.mapping = autoGuess(loaded.rawHeaders)
    }
    setState(loaded)
  }, [router])

  const update = (field: string, source: string) => {
    const next = { ...state, mapping: { ...state.mapping, [field]: source } }
    setState(next)
    setWizard('import', next)
  }

  const requiredOk = CRM_FIELDS.filter((f) => f.required).every((f) => !!state.mapping[f.key])

  const next = () => {
    setWizard('import', state)
    router.push('/lab/import-contacts/review')
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Map fields</h1>
        <p className="text-muted-foreground">
          Match CSV columns to CRM fields. Required fields are marked.
        </p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="map" />

      <div className="rounded-lg border bg-card divide-y">
        {CRM_FIELDS.map((f) => (
          <div
            key={f.key}
            className="grid grid-cols-[1fr,auto,2fr] gap-4 items-center px-4 py-3"
            data-field={f.key}
          >
            <div>
              <div className="font-medium text-sm">{f.label}</div>
              <div className="text-xs text-muted-foreground">
                {f.required ? 'Required' : 'Optional'}
              </div>
            </div>
            <span className="text-muted-foreground text-sm">←</span>
            <select
              value={state.mapping[f.key] || ''}
              onChange={(e) => update(f.key, e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              data-testid={`map-${f.key}`}
            >
              <option value="">Do not import</option>
              {state.rawHeaders.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {!requiredOk && (
        <p className="text-xs text-muted-foreground">
          Map all required fields to continue.
        </p>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/lab/import-contacts/upload')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!requiredOk}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="continue"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
