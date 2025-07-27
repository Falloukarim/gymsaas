// src/types/index.ts
export type Member = {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  qr_code?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  gym_id?: string | null;
  has_subscription: boolean;
};

export type Gym = {
  id: string;
  name: string;
  logo_url?: string | null;
  // other gym properties...
};

export type MemberSubscription = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  subscription?: {
    type: string;
    description?: string;
  };
};

export type MemberWithDetails = Member & {
  gyms?: Gym | null;
  member_subscriptions?: MemberSubscription[];
};