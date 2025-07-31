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
    setIsSubmitting(true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/gyms/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Échec de la création');
        }

        const gym = await response.json();
        resolve(gym);
        setTimeout(() => {
          window.location.href = `/gyms/${gym.id}/dashboard`;
        }, 1500); // Délai pour laisser voir le toast de succès
      } catch (error) {
        reject(error);
      } finally {
        setIsSubmitting(false);
      }
    });

    toast.promise(promise, {
      loading: <div className="flex items-center gap-2">
        <span className="animate-pulse">...</span>
        <span>Création de votre salle en cours</span>
      </div>,
      success: (gym: any) => {
        return <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Salle "{gym.name}" créée avec succès!</span>
        </div>;
      },
      error: (error) => {
        return <div className="flex items-center gap-2">
          <span>✕</span>
          <span>{error.message || 'Une erreur est survenue'}</span>
        </div>;
      },
    });
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
          {/* ... (les autres champs du formulaire restent identiques) ... */}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">...</span>
                <span>Création en cours</span>
              </span>
            ) : (
              "Créer la salle"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}