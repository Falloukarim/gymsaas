'use client';

import { Button } from '@/components/ui/button';
import { downloadMemberBadge } from '@/utils/downloadBadge';

export function DownloadMemberBadgeButton({ member }: { member: any }) {
  return (
    <Button
      variant="outline"
      onClick={() => downloadMemberBadge(member)}
    >
      Télécharger le badge
    </Button>
  );
}