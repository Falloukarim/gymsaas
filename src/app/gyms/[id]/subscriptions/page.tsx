'use client';

import { use } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SubscriptionForm from '@/components/SubscriptionForm';

export default function SubscriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gymId = resolvedParams.id;

  const supabase = createClient();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur de chargement des abonnements');
      console.error(error);
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [gymId]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } else {
      toast.success('Abonnement supprimé avec succès');
      fetchSubscriptions();
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des abonnements</h1>
          <p className="text-sm text-muted-foreground">
            Créez et gérez les abonnements de votre salle
          </p>
        </div>
        <SubscriptionForm gymId={gymId} onSuccess={fetchSubscriptions} />
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucun abonnement créé pour cette salle</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="border rounded-lg p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{sub.type}</h3>
                <p className="text-2xl font-semibold my-2">€{sub.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Durée: {sub.duration_days} jours
                </p>
                {sub.description && (
                  <p className="mt-2 text-sm">{sub.description}</p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(sub.id)}
                  disabled={loading}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
