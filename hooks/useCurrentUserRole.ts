'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function useCurrentUserRole(gymId: string) {
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('gbus')
          .select('role')
          .eq('gym_id', gymId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erreur récupération rôle:', error);
          setRole(null);
        } else {
          setRole(data?.role || null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    };

    fetchRole();
  }, [gymId]);

  return { role, loading };
}
