// TypeScript type for user roles
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff'
} as const;

export const UserRoleValue = ['superadmin', 'owner', 'admin', 'staff'] as const;
export type UserRoleValue = (typeof UserRoleValue)[number];

// Type for the role string values
export type Role = typeof USER_ROLES[keyof typeof USER_ROLES]; 

// Optional: if you also want to use the keys like 'SUPERADMIN', 'OWNER', 'ADMIN', 'STAFF'
export type UserRoleKey = keyof typeof USER_ROLES;

// Permissions pour chaque rôle
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPERADMIN]: {
    canManageGyms: true,
    canManageMembers: true,
    canManageSubscriptions: true,
    canManagePayments: true,
    canManageStaff: true,
    inviteUsers: true,
    changeRoles: true
  },
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

// Hiérarchie des rôles
export const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 4,
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
