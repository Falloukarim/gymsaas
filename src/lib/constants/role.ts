export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff'
} as const

export type UserRole = keyof typeof USER_ROLES
export type UserRoleValue = typeof USER_ROLES[UserRole];

export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: {
    canManageGyms: true,
    canManageMembers: true,
    canManageSubscriptions: true,
    canManagePayments: true,
    canManageStaff: true
  },
  [USER_ROLES.ADMIN]: {
    canManageGyms: false,
    canManageMembers: true,
    canManageSubscriptions: true,
    canManagePayments: true,
    canManageStaff: false
  },
  [USER_ROLES.STAFF]: {
    canManageGyms: false,
    canManageMembers: true,
    canManageSubscriptions: false,
    canManagePayments: true,
    canManageStaff: false
  }
}

export const ROLE_HIERARCHY = {
  [USER_ROLES.OWNER]: 3,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.STAFF]: 1
}