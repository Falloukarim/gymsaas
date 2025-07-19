'use client';

import { Button } from '@/components/ui/button';
import { downloadMemberBadge } from '@/utils/downloadBadge';

export function DownloadMemberBadgeButton({ member, gymLogoUrl, memberPhotoUrl }: { 
  member: any;
  gymLogoUrl?: string;
  memberPhotoUrl?: string;
}) {
  return (
    <Button
      onClick={() => downloadMemberBadge(member, gymLogoUrl, memberPhotoUrl)}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
    >
      Télécharger le badge
    </Button>
  );
}