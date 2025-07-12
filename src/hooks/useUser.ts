'use client';

import { UserRoleValue } from "@/lib/constants/role";

interface User {
  id: string;
  email: string;
  role: UserRoleValue;
}

export function useUser(): User {
  // MOCK temporaire pour le front (remplace par ton auth plus tard)
  return {
    id: '123',
    email: 'test@gym.com',
    role: 'owner', // 🔥 Met 'admin' ou 'staff' selon tes tests
  };
}
