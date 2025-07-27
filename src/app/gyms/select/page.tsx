import { GymSelection } from '@/components/auth/GymSelection';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GymSelectionPage() {
  return (
    <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
      <Suspense fallback={<Skeleton />}>
        <GymSelection />
      </Suspense>
    </div>
  );
}