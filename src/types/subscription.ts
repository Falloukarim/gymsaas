export type MemberSubscriptionWithPlan = {
  id: string;
  member_id: string;
  subscription_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  gym_id?: string | null;
  subscription?: {
    id: string;
    gym_id: string;
    price: number;
    duration_days: number;
    description?: string | null;
    type: string;
    is_session: boolean;
    session_price?: number | null;
    created_at: string;
  };
};