'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SubscriptionForm from '@/components/SubscriptionForm';

export default function SubscriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ typage en Promise
}) {
  const [gymId, setGymId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Résoudre params au montage
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

  console.log('Subscriptions data:', subscriptions);
  console.log('Loading state:', loading);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des abonnements</h1>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les abonnements de votre salle
          </p>
        </div>
        {gymId && (
          <SubscriptionForm gymId={gymId} onSuccess={() => fetchSubscriptions(gymId)} />
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">Chargement en cours...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Aucun abonnement créé pour cette salle</p>
          {gymId && (
            <SubscriptionForm gymId={gymId} onSuccess={() => fetchSubscriptions(gymId)} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="border rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg capitalize">{sub.type}</h3>
                <p className="text-2xl font-semibold my-2">€{sub.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Durée: {sub.duration_days} jours
                </p>
                {sub.description && (
                  <p className="mt-2 text-sm text-gray-600">{sub.description}</p>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(sub.id)}
                  disabled={loading}
                >
                  {loading ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
