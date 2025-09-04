// src/components/members/MemberActionButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MemberActionButtonsProps {
  gymId: string;
  memberId: string;
  hasActiveSubscription: boolean;
  hasLastSubscription: boolean;
}

export function MemberActionButtons({ 
  gymId, 
  memberId, 
  hasActiveSubscription, 
  hasLastSubscription 
}: MemberActionButtonsProps) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string, setLoading: (value: boolean) => void) => {
    setLoading(true);
    router.push(path);
  };

  return (
    <div className="flex flex-col xs:flex-row gap-2 pt-4">
      {hasActiveSubscription || hasLastSubscription ? (
        <Button
          size="sm"
          className="w-full"
          disabled={isRenewing}
          onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/renew`, setIsRenewing)}
        >
          {isRenewing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Chargement...
            </>
          ) : (
            'Renouveler'
          )}
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full"
          disabled={isRenewing}
          onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/renew`, setIsRenewing)}
        >
          {isRenewing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Chargement...
            </>
          ) : (
            'Ajouter un abonnement'
          )}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={isAddingSession}
        onClick={() => handleNavigation(`/gyms/${gymId}/members/${memberId}/new-session`, setIsAddingSession)}
      >
        {isAddingSession ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Chargement...
          </>
        ) : (
          'Nouvelle session'
        )}
      </Button>
    </div>
  );
}