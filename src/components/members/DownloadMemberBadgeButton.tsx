// src/components/members/DownloadMemberBadgeButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { downloadMemberBadge } from '@/utils/downloadBadge';
import { toast } from 'sonner';
import { MemberWithGym } from '@/types';

interface DownloadMemberBadgeButtonProps {
  member: MemberWithGym;
  className?: string;
}


export function DownloadMemberBadgeButton({ 
  member,
  className 
}: DownloadMemberBadgeButtonProps) {
  const handleDownload = async () => {
    try {
      await downloadMemberBadge({
        id: member.id,
        full_name: member.full_name,
        avatar_url: member.avatar_url || undefined,
        qr_code: member.qr_code || '',
        gyms: member.gyms,
        member_subscriptions: member.member_subscriptions
      }, member.gyms?.logo_url);
      
      toast.success('Badge téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du badge');
      console.error(error);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg ${className}`}
    >
      Télécharger le badge
    </Button>
  );
}