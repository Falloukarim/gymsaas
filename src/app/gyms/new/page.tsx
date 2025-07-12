'use client';

import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const gymSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  address: z.string().min(5),
  city: z.string().min(2),
  postal_code: z.string().min(4),
});

export default function NewGymPage() {
  const router = useRouter();
  const supabase = createClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(gymSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      // 1. Créer le gym
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert(data)
        .select()
        .single();

      if (gymError) throw gymError;

      // 2. Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 3. Créer l'association owner
      const { error: gbusError } = await supabase
        .from('gbus')
        .insert({
          gym_id: gym.id,
          user_id: user.id,
          role: 'owner'
        });

      if (gbusError) throw gbusError;

      toast.success('Gym créé avec succès!');
      router.push(`/gyms/${gym.id}`);
    } catch (error) {
      toast.error('Erreur lors de la création du gym');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer votre salle de sport</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du gym *</Label>
          <Input
            id="name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            {...register('address')}
            error={errors.address?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              {...register('city')}
              error={errors.city?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Code postal *</Label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              error={errors.postal_code?.message}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Créer la salle
        </Button>
      </form>
    </div>
  );
}