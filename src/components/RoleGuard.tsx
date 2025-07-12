'use client';

import {ROLE_PERMISSIONS, ROLE_HIERARCHY, UserRoleValue  } from '@/lib/constants/role';
import { redirect } from 'next/navigation';
import { useUser } from '@/hooks/useUser'; // 🔥 À créer si ce n'est pas déjà fait

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRoleValue;
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[UserRoleValue];
}

export function RoleGuard({ children, requiredRole, requiredPermission }: RoleGuardProps) {
  const { role } = useUser(); // 🔥 Hook personnalisé qui retourne { role: UserRoleValue }

  // Vérifier la hiérarchie des rôles si requiredRole est spécifié
  if (requiredRole && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
    redirect('/unauthorized');
  }

  // Vérifier les permissions si requiredPermission est spécifié
  if (requiredPermission && !ROLE_PERMISSIONS[role][requiredPermission]) {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
