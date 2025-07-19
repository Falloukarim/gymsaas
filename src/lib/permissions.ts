import { USER_ROLES } from './constants/role';

export const can = (userRole: string, permission: string) => {
  const rolePermissions = {
    [USER_ROLES.OWNER]: {
      manageGym: true,
      manageMembers: true,
      manageSubscriptions: true,
      managePayments: true,
      manageStaff: true,
      inviteUsers: true,
      changeRoles: true
    },
    [USER_ROLES.ADMIN]: {
      manageGym: false,
      manageMembers: true,
      manageSubscriptions: true,
      managePayments: true,
      manageStaff: false,
      inviteUsers: true,
      changeRoles: false
    },
    [USER_ROLES.STAFF]: {
      manageGym: false,
      manageMembers: true,
      manageSubscriptions: false,
      managePayments: true,
      manageStaff: false,
      inviteUsers: false,
      changeRoles: false
    }
  };

  return rolePermissions[userRole]?.[permission] ?? false;
};

export const hasHigherOrEqualRole = (currentRole: string, targetRole: string) => {
  const hierarchy = {
    [USER_ROLES.OWNER]: 3,
    [USER_ROLES.ADMIN]: 2,
    [USER_ROLES.STAFF]: 1
  };

  return hierarchy[currentRole] >= hierarchy[targetRole];
};