// Core CRM Data Types

export interface Account {
  id: string
  name: string
  industry: string | null
  companySize: string | null
  owner: string | null
  healthStatus: string
  arr: number | null
  website: string | null
  phone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  accountId: string | null
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  role: string | null
  title: string | null
  communicationPreference: string
  createdAt: string
  updatedAt: string
}

export interface Opportunity {
  id: string
  accountId: string | null
  name: string
  stage: string
  value: number | null
  probability: number
  closeDate: string | null
  nextSteps: string | null
  owner: string | null
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  type: string
  subject: string | null
  description: string | null
  accountId: string | null
  contactId: string | null
  opportunityId: string | null
  owner: string | null
  activityDate: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  accountId: string | null
  contactId: string | null
  opportunityId: string | null
  caseId: string | null
  owner: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface Case {
  id: string
  accountId: string | null
  contactId: string | null
  subject: string
  description: string | null
  status: string
  priority: string
  category: string | null
  resolution: string | null
  satisfactionRating: number | null
  owner: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: number | null
  status: string
  category: string | null
  createdAt: string
  updatedAt: string
}

export interface OpportunityProduct {
  id: string
  opportunityId: string
  productId: string
  quantity: number
  discount: number
  total: number | null
  createdAt: string
}

// Extended types with relations
export interface AccountWithRelations extends Account {
  contacts?: Contact[]
  opportunities?: Opportunity[]
  activities?: Activity[]
  tasks?: Task[]
  cases?: Case[]
}

export interface OpportunityWithProducts extends Opportunity {
  products?: (OpportunityProduct & { product: Product })[]
}

export interface ActivityWithRelations extends Activity {
  account?: Account
  contact?: Contact
  opportunity?: Opportunity
}

// Enum types
export type OpportunityStage =
  | 'Prospecting'
  | 'Qualification'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost'

export type TaskStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'

export type CaseStatus =
  | 'New'
  | 'In Progress'
  | 'Waiting'
  | 'Closed'

export type Priority =
  | 'Low'
  | 'Medium'
  | 'High'

export type HealthStatus =
  | 'Excellent'
  | 'Good'
  | 'At Risk'

export type ActivityType =
  | 'Email'
  | 'Call'
  | 'Meeting'
  | 'Note'

// UI State types
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface Modal {
  isOpen: boolean
  type: string | null
  data?: any
}

export interface Drawer {
  isOpen: boolean
  type: string | null
  data?: any
}
