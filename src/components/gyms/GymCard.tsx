import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Gym } from '@/lib/types';

interface GymCardProps {
  gym: Gym;
  isOwner?: boolean;
}

export function GymCard({ gym, isOwner = false }: GymCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{gym.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{gym.address}</p>
        <p className="text-sm font-medium">{gym.phone}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link href={`/gyms/${gym.id}`}>
            Voir détails
          </Link>
        </Button>
        {isOwner && (
          <Button asChild variant="destructive">
            <Link href={`/gyms/${gym.id}/edit`}>
              Modifier
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}