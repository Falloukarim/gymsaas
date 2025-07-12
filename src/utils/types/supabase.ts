import { UserRoleValue } from "@/lib/constants/role";
import { Member } from "@/lib/types";
// types/database.types.ts (mock temporaire)

export type Database = {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          name: string;
          address: string;
          phone: string;
        };
      };
      members: {
        Row: {
          id: string;
          gym_id: string;
          full_name: string;
          phone: string;
          email?: string;
          created_at: string;
          role: UserRoleValue;
        };
        Insert: {
          gym_id: string;
          full_name: string;
          phone: string;
          email?: string;
          role: UserRoleValue;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          price: number;
          duration_days: number;
          description?: string;
          created_at: string;
        };
        Insert: {
          gym_id: string;
          name: string;
          price: number;
          duration_days: number;
          description?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          type: 'subscription' | 'session';
          session_date?: string;
          subscription_id?: string;
          created_at: string;
        };
        Insert: {
          member_id: string;
          amount: number;
          type: 'subscription' | 'session';
          session_date?: string;
          subscription_id?: string;
        };
      };
    };
  };
};
export type Payment = Database['public']['Tables']['payments']['Row'];

export type PaymentWithMember = Payment & {
  member?: {
    full_name: string;
    phone: string;
  };
};

export type EnrichedMember = Member & {
  subscription_status: 'active' | 'inactive';
};
