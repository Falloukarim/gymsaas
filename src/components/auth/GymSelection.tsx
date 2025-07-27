'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Assurez-vous que ces classes sont bien définies dans votre CSS
const classes = {
  container: 'max-w-md mx-auto w-full p-6 rounded-xl shadow-sm border bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
  title: 'text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white',
  button: 'w-full justify-between h-14 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600',
  buttonText: 'font-medium text-gray-800 dark:text-white',
  roleText: 'text-sm text-gray-500 dark:text-gray-400 ml-2 capitalize'
};

interface GymMembership {
  gym_id: string;
  gyms: {
    name: string;
  };
  role: string;
}

export function GymSelection() {
  const [gyms, setGyms] = useState<GymMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
          setError('Session expirée, veuillez vous reconnecter');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('gbus')
          .select('gym_id, gyms(name), role')
          .eq('user_id', user.id);

        if (error) throw error;
        setGyms(data as unknown as GymMembership[]);
      } catch (err) {
        setError('Erreur lors du chargement des gyms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  useEffect(() => {
    if (!loading && gyms.length === 1 && !error) {
      router.push(`/gyms/${gyms[0].gym_id}/dashboard`);
    }
  }, [gyms, loading, router, error]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-sm text-gray-500">Chargement en cours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg bg-red-100 border border-red-400 text-red-700">
        <p className="text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {gyms.length > 1 ? (
        <>
          <h2 className={classes.title}>Choisissez un gym</h2>
          <div className="space-y-3">
            {gyms.map((gym) => (
              <Link 
                key={gym.gym_id}
                href={`/gyms/${gym.gym_id}/dashboard`}
                className={classes.button}
              >
                <span className={classes.buttonText}>{gym.gyms.name}</span>
                <span className={classes.roleText}>({gym.role})</span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className={classes.title}>Bienvenue 👋</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Vous n'avez encore rejoint aucun gym.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/gyms/new" 
              className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
            >
              Créer un nouveau gym
            </Link>
            <Link 
              href="/gyms/join" 
              className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
            >
              Rejoindre un gym existant
            </Link>
          </div>
        </>
      )}
    </div>
  );
}