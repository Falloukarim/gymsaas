// TypeScript type for user roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff'
} as const;
export const UserRoleValue = ['owner', 'admin', 'staff'] as const;
export type UserRoleValue = (typeof UserRoleValue)[number];
// Type for the role string values: "owner", "admin", "staff"
export type Role = typeof USER_ROLES[keyof typeof USER_ROLES]; // <-- Type 'Role' exporté ici

// Optional: if you also want to use the keys like 'OWNER', 'ADMIN', 'STAFF'
export type UserRoleKey = keyof typeof USER_ROLES;

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
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  staff: 1
};

// Permissions utilisées dans le système
export type Permission =
  | 'manageGym'
  | 'manageMembers'
  | 'manageSubscriptions'
  | 'managePayments'
  | 'manageStaff'
  | 'inviteUsers'
  | 'changeRoles';
