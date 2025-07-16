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
import { useState } from 'react';

const gymSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  address: z.string().min(5),
  phone: z.string().min(7, 'Numéro de téléphone invalide'),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

export default function NewGymPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(gymSchema)
  });

 const onSubmit = async (data: z.infer<typeof gymSchema>) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Non authentifié")

    // 1. Création gym avec transaction
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .insert({
        ...data,
        owner_id: user.id
      })
      .select()
      .single()

    if (gymError) throw gymError

    // 2. Création association avec vérification forcée
    const { error: gbusError } = await supabase
      .from('gbus')
      .insert({
        gym_id: gym.id,
        user_id: user.id,
        role: 'owner'
      })
      .select()
      .single()

    if (gbusError) {
      await supabase.from('gyms').delete().eq('id', gym.id)
      throw gbusError
    }

    // 3. Rafraîchissement forcé du cache côté serveur
    await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin'
    })

    // 4. Redirection avec rechargement complet
    window.location.assign(`/gyms/${gym.id}/dashboard?t=${Date.now()}`)

  } catch (error) {
    toast.error(error.message || "Erreur création")
    console.error("Erreur création gym", error)
  } finally {
    setIsSubmitting(false)
  }
}

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

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              {...register('city')}
              error={errors.city?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              error={errors.postal_code?.message}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "Créer la salle"}
        </Button>
      </form>
    </div>
  );
}