// hooks/useGymPermissions.ts
'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

export function useGymPermissions(gymId: string) {
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gbus')
        .select('role')
        .eq('gym_id', gymId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setRole(data.role);
      }
      setLoading(false);
    };

    fetchRole();
  }, [gymId]);

  return {
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    isStaff: role === 'staff' || role === 'admin' || role === 'owner',
    loading
  };
}