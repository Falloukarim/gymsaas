'use client';

import { QRCodeGenerator } from './QRCodeGenerator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface MemberCardProps {
  member: {
    id: string;
    qr_code: string;
    qr_image_url: string;
    subscription_status: 'active' | 'expired';
    full_name: string; // Ajouté
  };
}

export function MemberCard({ member }: MemberCardProps) {
  const handleDownloadBadge = () => {
    // Téléchargement direct depuis Cloudinary
    window.open(
      member.qr_image_url.replace('/upload/', '/upload/fl_attachment/'),
      '_blank'
    );
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{member.full_name}</h3>
          <p className="text-sm text-muted-foreground">
            {member.subscription_status === 'active' 
              ? 'Abonnement actif' 
              : 'Abonnement expiré'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadBadge}
          >
            <Download className="h-4 w-4 mr-2" />
            Badge
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <QRCodeGenerator 
          value={member.qr_code} 
          size={160}
          withDownload={false}
        />
      </div>
    </div>
  );
}