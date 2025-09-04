'use client';

import { Button } from '@/components/ui/button';
import { downloadMemberBadge } from '@/utils/downloadBadge';
import { toast } from 'sonner';
import { MemberWithDetails } from '@/types';
import { useState } from 'react';
import { Spinner } from '../ui/spinner';

interface DownloadMemberBadgeButtonProps {
  member: MemberWithDetails;
  className?: string;
}

export function DownloadMemberBadgeButton({ 
  member,
  className 
}: DownloadMemberBadgeButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadMemberBadge({
        id: member.id,
        full_name: member.full_name,
        avatar_url: member.avatar_url || undefined,
        qr_code: member.qr_code || '',
        gyms: member.gyms || undefined,
      }, member.gyms?.logo_url || undefined);
      
      toast.success('Badge téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du badge');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg ${className}`}
    >
    {isDownloading ? (
  <>
    <Spinner size="sm" className="mr-2" />
    Génération...
  </>
) : (
  'Télécharger le badge'
)}
    </Button>
  );
}