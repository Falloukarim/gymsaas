'use client';

import { createClient } from '@/lib/supabaseClient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';

const gymSchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .min(2, 'Minimum 2 caractères')
    .refine(val => val.trim().length >= 2, 'Doit contenir au moins 2 caractères non vides'),
  address: z.string()
    .min(1, 'L\'adresse est requise')
    .min(5, 'Adresse trop courte (min 5 caractères)'),
  phone: z.string()
    .min(1, 'Le téléphone est requis')
    .min(9, 'Minimum 9 chiffres')
    .refine(val => /^[0-9]+$/.test(val), 'Doit contenir uniquement des chiffres'),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

export default function NewGymPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof gymSchema>>({
    resolver: zodResolver(gymSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      city: '',
      postal_code: ''
    }
  });

const onSubmit = async (formData: z.infer<typeof gymSchema>) => {
  try {
    const response = await fetch('/api/gyms/create', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error(await response.text());
    
    const gym = await response.json();
    window.location.href = `/gyms/${gym.id}/dashboard`;
  } catch (error) {
    toast.error("Échec de la création");
    console.error(error);
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
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  placeholder="Nom de votre salle"
                  aria-invalid={!!errors.name}
                />
              )}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="address"
                  placeholder="Adresse complète"
                  aria-invalid={!!errors.address}
                />
              )}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  placeholder="Numéro de téléphone"
                  aria-invalid={!!errors.phone}
                />
              )}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="city"
                    placeholder="Ville"
                  />
                )}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="postal_code"
                    placeholder="Code postal"
                  />
                )}
              />
              {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Création en cours..." : "Créer la salle"}
          </Button>
        </form>
      </div>
    </div>
  );
}