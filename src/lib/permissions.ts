import { Role, Permission  } from "./constants/role";

type RolePermissions = Record<Role, Record<Permission, boolean>>;

const rolePermissions: RolePermissions = {
  owner: {
    manageGym: true,
    manageMembers: true,
    manageSubscriptions: true,
    managePayments: true,
    manageStaff: true,
    inviteUsers: true,
    changeRoles: true
  },
  admin: {
    manageGym: false,
    manageMembers: true,
    manageSubscriptions: true,
    managePayments: true,
    manageStaff: false,
    inviteUsers: true,
    changeRoles: false
  },
  staff: {
    manageGym: false,
    manageMembers: true,
    manageSubscriptions: false,
    managePayments: true,
    manageStaff: false,
    inviteUsers: false,
    changeRoles: false
  }
};

export const can = (userRole: Role, permission: Permission): boolean => {
  return rolePermissions[userRole]?.[permission] ?? false;
};

const roleHierarchy: Record<Role, number> = {
  owner: 3,
  admin: 2,
  staff: 1
};

export const hasHigherOrEqualRole = (currentRole: Role, targetRole: Role): boolean => {
  return roleHierarchy[currentRole] >= roleHierarchy[targetRole];
};
