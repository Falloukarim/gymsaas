// src/types/index.d.ts
// src/types/index.d.ts
export interface Gym {
  name: string;
  logo_url?: string; // Retire le type null pour correspondre à l'interface attendue
}

export interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  qr_code: string;
  gyms?: Gym; // Utilise l'interface Gym mise à jour
  member_subscriptions?: Array<{
    end_date: string;
    subscriptions?: {
      type?: string;
    };
  }>;
}

export interface MemberWithGym extends Member {
  // Peut étendre ou rester identique selon vos besoins
}

export interface MemberWithGym extends Member {
  gyms?: Gym;
  member_subscriptions?: Array<{
    end_date: string;
    subscriptions?: {
      type?: string;
      description?: string;
    };
  }>;
}

export interface Subscription {
  id: string;
  type: string;
  price: number;
  duration_days: number;
  description?: string;
}