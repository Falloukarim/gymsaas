'use client';

import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function MemberSubscriptionBadge({
  subscriptions,
}: {
  subscriptions: {
    end_date: string;
    subscription: { name: string };
  }[];
}) {
  if (!subscriptions?.length) {
    return <Badge variant="secondary">Aucun abonnement</Badge>;
  }

  const activeSub = subscriptions.find(
    sub => new Date(sub.end_date) > new Date()
  );

  return activeSub ? (
    <div className="space-y-1">
      <Badge>{activeSub.subscription.name}</Badge>
      <p className="text-sm text-muted-foreground">
        Valide jusqu'au {format(new Date(activeSub.end_date), 'PP', { locale: fr })}
      </p>
    </div>
  ) : (
    <Badge variant="destructive">Aucun abonnement actif</Badge>
  );
}