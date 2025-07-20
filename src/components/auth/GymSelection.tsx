'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function GymSelection() {
  const supabase = createClient();
  const router = useRouter();
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gbus')
        .select('gym_id, gyms(name), role')
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
      } else {
        setGyms(data || []);
      }
      setLoading(false);
    };

    fetchGyms();
  }, []);

  // ✅ Redirection dans un useEffect
  useEffect(() => {
    if (!loading && gyms.length === 1) {
      router.push(`/gyms/${gyms[0].gym_id}/dashboard`);
    }
  }, [gyms, loading, router]);

  if (loading) return <div>Chargement...</div>;

  if (gyms.length === 1) {
    return <div>Redirection en cours...</div>; // Évite de rien retourner
  }

  if (gyms.length > 1) {
    return (
      <div className="space-y-4">
        <h2>Choisissez un gym</h2>
        {gyms.map(gym => (
          <Button key={gym.gym_id} asChild>
            <Link href={`/gyms/${gym.gym_id}/dashboard`}>
              {gym.gyms.name} ({gym.role})
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  // Aucun gym
  return (
    <div className="space-y-4">
      <h2>Que souhaitez-vous faire ?</h2>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/gyms/new">Créer un nouveau gym</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gyms/join">Rejoindre un gym existant</Link>
        </Button>
      </div>
    </div>
  );
}
