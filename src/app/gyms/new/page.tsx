'use client';

import { createClient } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';

const gymSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  address: z.string().min(5, 'Adresse invalide'),
  phone: z.string().min(7, 'Numéro de téléphone invalide'),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

export default function NewGymPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof gymSchema>>({
    resolver: zodResolver(gymSchema),
  });

  const onSubmit = async (data: z.infer<typeof gymSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Utilisateur non authentifié");

      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({ ...data, owner_id: user.id })
        .select()
        .single();

      if (gymError) throw new Error(gymError.message || "Erreur lors de la création du gym");

      const { data: gbus, error: gbusError } = await supabase
        .from('gbus')
        .insert({
          gym_id: gym.id,
          user_id: user.id,
          role: 'owner',
        })
        .select()
        .single();

      if (gbusError) {
        await supabase.from('gyms').delete().eq('id', gym.id);
        throw new Error(gbusError.message || "Erreur lors de l'association utilisateur");
      }

      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
      });

      window.location.assign(`/gyms/${gym.id}/dashboard?t=${Date.now()}`);

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : "Erreur inconnue";

      toast.error(errorMessage);
      console.error("Erreur création gym :", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-black border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Créer une salle de sport</h1>
          <p className="text-sm text-white">
            Renseignez les informations nécessaires pour créer votre établissement.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du gym *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input id="postal_code" {...register('postal_code')} />
              {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Création en cours..." : "Créer la salle"}
          </Button>
        </form>
      </div>
    </div>
  );
}
