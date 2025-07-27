export type Gym = {
  id: string;
  name: string;
  address: string;
  phone: string;
  postal_code?: string | null;
  city?: string | null;
  logo_url?: string | null;
  default_session_price?: number | null;
  created_at: string;
  owner_id?: string | null;
};