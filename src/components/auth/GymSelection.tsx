'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface GymMembership {
  gym_id: string;
  gyms: {
    name: string;
  };
  role: string;
}

export function GymSelection() {
  const supabase = createClient();
  const router = useRouter();
  const [gyms, setGyms] = useState<GymMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!user || authError) {
        setLoading(false);
        return;
      }

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

  useEffect(() => {
    if (!loading && gyms.length === 1) {
      router.push(`/gyms/${gyms[0].gym_id}/dashboard`);
    }
  }, [gyms, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Chargement en cours...</span>
      </div>
    );
  }

  if (gyms.length === 1) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Redirection vers votre gym...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-2xl shadow-md border bg-background space-y-6">
      {gyms.length > 1 ? (
        <>
          <h2 className="text-2xl font-semibold text-center">Choisissez un gym</h2>
          <div className="space-y-3">
            {gyms.map((gym) => (
              <Button key={gym.gym_id} asChild className="w-full justify-between">
                <Link href={`/gyms/${gym.gym_id}/dashboard`}>
                  <span>{gym.gyms.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">({gym.role})</span>
                </Link>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-center">Bienvenue 👋</h2>
          <p className="text-sm text-muted-foreground text-center">
            Vous n'avez encore rejoint aucun gym.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full bg-black">
              <Link href="/gyms/new">Créer un nouveau gym</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-black">
              <Link href="/gyms/join">Rejoindre un gym existant</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
