import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Database } from '@/utils/types/supabase';
import Link from 'next/link';
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface SubscriptionCardProps {
  subscription: Subscription;
  gymId: string;
}

export function SubscriptionCard({ subscription, gymId }: SubscriptionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{subscription.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">€{subscription.price.toFixed(2)}</p>
          <p className="text-sm text-gray-600">
            {subscription.duration_days} days
          </p>
          {subscription.description && (
            <p className="text-sm mt-2">{subscription.description}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={`/gyms/${gymId}/subscriptions/${subscription.id}/edit`}>
            Edit
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/gyms/${gymId}/subscriptions/${subscription.id}/assign`}>
            Assign
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}