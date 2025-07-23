'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InlineSubscriptionForm from '@/components/subscriptions/InlineSubscriptionForm';
import SessionForm from '@/components/susbscriptions/SessionForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [gymId, setGymId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setGymId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const fetchSubscriptions = async (resolvedGymId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('gym_id', resolvedGymId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (error) {
      toast.error('Erreur de chargement des abonnements');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gymId) {
      fetchSubscriptions(gymId);
    }
  }, [gymId]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Abonnement supprimé avec succès');
      if (gymId) await fetchSubscriptions(gymId);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Link
          href={`/gyms/${gymId}/dashboard`}
          className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="whitespace-nowrap">Retour au dashboard</span>
        </Link>
        
        <div className="order-first sm:order-none text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold">Gestion des abonnements</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Créez et gérez les abonnements et sessions de votre salle
          </p>
        </div>
      </div>

      {/* Forms section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Abonnements standards</h2>
          {gymId && (
            <InlineSubscriptionForm 
              gymId={gymId} 
              onSuccess={() => fetchSubscriptions(gymId)}
            />
          )}
        </div>

        <div className="border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Sessions prédéfinies</h2>
          {gymId && (
            <SessionForm 
              gymId={gymId} 
              onSuccess={() => fetchSubscriptions(gymId)} 
            />
          )}
        </div>
      </div>

      {/* Subscriptions list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-sm sm:text-base">Chargement en cours...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8 sm:py-12 border rounded-lg">
          <p className="text-sm sm:text-base text-muted-foreground">Aucun abonnement créé pour cette salle</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Standard subscriptions */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Abonnements</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {subscriptions
                .filter(sub => !sub.is_session)
                .map(sub => (
                  <div key={sub.id} className="border rounded-lg p-3 sm:p-4 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg capitalize">{sub.type}</h3>
                      <p className="text-xl sm:text-2xl font-semibold my-1 sm:my-2">{sub.price} FCFA</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Durée: {sub.duration_days} jours
                      </p>
                      {sub.description && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">{sub.description}</p>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(sub.id)}
                        disabled={loading}
                        className="text-xs sm:text-sm"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sessions */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Sessions</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {subscriptions
                .filter(sub => sub.is_session)
                .map(session => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-3 sm:p-4 flex flex-col shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg">Session</h3>
                      <p className="text-xl sm:text-2xl font-semibold my-1 sm:my-2">{session.price} FCFA</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Accès: 1 jour</p>
                      {session.description && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                          {session.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        disabled={loading}
                        className="text-xs sm:text-sm"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}