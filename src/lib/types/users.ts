// src/lib/types/user.ts

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'owner' | 'admin' | 'staff';
  created_at: string;
}
