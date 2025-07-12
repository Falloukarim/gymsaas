import { User } from "./types/users";
export interface Member {
  id: string;
  gym_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  qr_code: string;
  created_at: string;
  qr_image_url: string;
  
}
export interface MemberWithSubscription extends Member {
  member_subscriptions?: {
    id: string;
    subscription_id: string;
    start_date: string;
    end_date: string;
    subscription: {
      name: string;
      duration_days: number;
    };
  }[];
}

export interface MemberFormData {
  gym_id: string;
  full_name: string;
  email?: string;
  phone: string;
  subscription_id?: string; // Utilisé uniquement pour le formulaire
}

export interface MemberTableColumn {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (props: any) => React.ReactNode;
}
export interface Gym {
  id: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  owner_id: string;
  created_at: string;
  owner?: Pick<User, 'full_name' | 'email'>; // utilisation de User ici
}

export interface GymWithMembers extends Gym {
  members_count: number;
  active_subscriptions_count: number;
}

