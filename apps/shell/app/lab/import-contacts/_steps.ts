import type { Step } from '@/components/multistep/WizardSteps'

export const IMPORT_STEPS: Step[] = [
  { id: 'upload', label: 'Upload', href: '/lab/import-contacts/upload' },
  { id: 'map', label: 'Map fields', href: '/lab/import-contacts/map' },
  { id: 'review', label: 'Review', href: '/lab/import-contacts/review' },
]

export type ImportState = {
  fileName: string
  rawHeaders: string[]
  rows: string[][]
  mapping: Record<string, string> // CRM field -> source header
}

export const IMPORT_DEFAULT: ImportState = {
  fileName: '',
  rawHeaders: [],
  rows: [],
  mapping: {},
}

export const CRM_FIELDS = [
  { key: 'firstName', label: 'First name', required: true },
  { key: 'lastName', label: 'Last name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'title', label: 'Job title', required: false },
]

export const SAMPLE_HEADERS = ['First Name', 'Last Name', 'Email Address', 'Phone', 'Org', 'Role']
export const SAMPLE_ROWS: string[][] = [
  ['Priya', 'Ramanathan', 'priya@acme.com', '415-555-0182', 'ACME Corp', 'VP Ops'],
  ['Marcus', 'Johnson', 'marcus@globex.io', '212-555-9931', 'Globex', 'CTO'],
  ['Yuki', 'Tanaka', 'yuki@initech.jp', '03-5555-4412', 'Initech', 'Head of Eng'],
  ['Sofia', 'Marin', 'sofia@umbrella.eu', '+34 91 555 4481', 'Umbrella', 'Director'],
  ['Jamal', 'Okafor', 'jamal@stark.ai', '929-555-0077', 'Stark AI', 'VP Sales'],
]
