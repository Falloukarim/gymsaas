// src/types/index.d.ts
import { Database } from '@/types/supabase';

export type Member = Database['public']['Tables']['members']['Row'];
export type Gym = Database['public']['Tables']['gyms']['Row'];
export type MemberSubscription = Database['public']['Tables']['member_subscriptions']['Row'] & {
  subscription?: Database['public']['Tables']['subscriptions']['Row'];
};

export type MemberWithSubscriptions = Member & {
  gyms?: Gym;
  member_subscriptions?: MemberSubscription[];
};