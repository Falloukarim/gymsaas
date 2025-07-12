'use client';

import { GymCard } from './GymCard';
import { Gym } from '@/lib/types';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GymListProps {
  gyms: Gym[];
  isOwner?: boolean;
}

export function GymList({ gyms, isOwner = false }: GymListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGyms = gyms.filter(gym =>
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gym.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Rechercher une salle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        {isOwner && (
          <Button asChild>
            <Link href="/gyms/new">
              Ajouter une salle
            </Link>
          </Button>
        )}
      </div>

      {filteredGyms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map(gym => (
            <GymCard 
              key={gym.id} 
              gym={gym} 
              isOwner={isOwner}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'Aucun résultat' : 'Aucune salle enregistrée'}
          </p>
        </div>
      )}
    </div>
  );
}