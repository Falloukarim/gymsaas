export const SUBSCRIPTION_TYPES = {
  MONTHLY: {
    id: 'monthly',
    name: 'Abonnement Mensuel',
    defaultDuration: 30,
    defaultPrice: 49.99
  },
  QUARTERLY: {
    id: 'quarterly',
    name: 'Trimestriel',
    defaultDuration: 90,
    defaultPrice: 129.99
  },
  YEARLY: {
    id: 'yearly',
    name: 'Annuel',
    defaultDuration: 365,
    defaultPrice: 399.99
  },
  DAY_PASS: {
    id: 'day_pass',
    name: 'Pass Journalier',
    defaultDuration: 1,
    defaultPrice: 9.99
  }
} as const

export type SubscriptionType = keyof typeof SUBSCRIPTION_TYPES

export const DEFAULT_SUBSCRIPTION_COLOR = '#00c9a7'

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PENDING: 'pending'
}