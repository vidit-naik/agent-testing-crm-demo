'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Wand2 } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import {
  IMPORT_STEPS,
  IMPORT_DEFAULT,
  CRM_FIELDS,
  type ImportState,
} from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

function autoGuess(headers: string[]) {
  const map: Record<string, string> = {}
  const index = new Map(headers.map((header) => [normalize(header), header]))
  const guess = (keys: string[]) => {
    for (const key of keys) {
      const match = index.get(normalize(key))
      if (match) return match
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

function confidence(field: string, header: string) {
  if (!header) return 0
  if (normalize(field) === normalize(header)) return 98
  if (normalize(header).includes(normalize(field)) || normalize(field).includes(normalize(header))) return 86
  if (field === 'company' && /org|account|company/i.test(header)) return 82
  if (field === 'title' && /role|job|position|title/i.test(header)) return 78
  return 55
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
      setWizard('import', loaded)
    }
    setState(loaded)
  }, [router])

  const requiredOk = CRM_FIELDS.filter((field) => field.required).every(
    (field) => !!state.mapping[field.key]
  )

  const mappedCount = CRM_FIELDS.filter((field) => !!state.mapping[field.key]).length

  const preview = useMemo(() => {
    const headerIdx = new Map(state.rawHeaders.map((header, index) => [header, index]))
    return state.rows.slice(0, 4).map((row) => {
      const out: Record<string, string> = {}
      CRM_FIELDS.forEach((field) => {
        const source = state.mapping[field.key]
        const index = source ? headerIdx.get(source) : undefined
        out[field.key] = index !== undefined ? row[index] || '' : ''
      })
      return out
    })
  }, [state])

  const update = (field: string, source: string) => {
    const next = { ...state, mapping: { ...state.mapping, [field]: source } }
    setState(next)
    setWizard('import', next)
  }

  const applyAutoMap = () => {
    const next = { ...state, mapping: autoGuess(state.rawHeaders) }
    setState(next)
    setWizard('import', next)
  }

  const next = () => {
    setWizard('import', state)
    router.push('/lab/import-contacts/review')
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Map fields</h1>
        <p className="text-muted-foreground">Match columns from {state.fileName || 'the file'} to CRM fields.</p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="map" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="text-sm font-semibold">Field mapping</h2>
              <p className="text-xs text-muted-foreground">{mappedCount} of {CRM_FIELDS.length} fields mapped</p>
            </div>
            <button
              type="button"
              onClick={applyAutoMap}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Wand2 className="h-4 w-4" />
              Auto-map
            </button>
          </div>

          <div className="divide-y">
            {CRM_FIELDS.map((field) => {
              const source = state.mapping[field.key] || ''
              const score = confidence(field.key, source)
              return (
                <div
                  key={field.key}
                  className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_220px_110px]"
                >
                  <div>
                    <div className="font-medium text-sm">{field.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {field.required ? 'Required' : 'Optional'}
                    </div>
                  </div>
                  <select
                    value={source}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="">Do not import</option>
                    {state.rawHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center md:justify-end">
                    {source ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        {score}% match
                      </span>
                    ) : field.required ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        Needed
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Readiness</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Required fields</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  {requiredOk && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  {requiredOk ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rows</span>
                <span className="font-medium">{state.rows.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Columns</span>
                <span className="font-medium">{state.rawHeaders.length.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Preview</h2>
            <div className="space-y-3">
              {preview.map((row, index) => (
                <div key={index} className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{row.firstName || '-'} {row.lastName || ''}</div>
                  <div className="text-muted-foreground">{row.email || 'No email'}</div>
                  <div className="text-xs text-muted-foreground">{row.company || 'No company'}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push('/lab/import-contacts/upload')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!requiredOk}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
