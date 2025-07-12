'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useActionState, useEffect, startTransition } from 'react';
import { createMember } from '@/actions/members/create';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const memberSchema = z.object({
  gym_id: z.string().min(1, 'Salle requise'),
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(6, 'Minimum 6 caractères'),
  subscription_id: z.string().optional()
});

export function MemberForm({
  gymId,
  gyms,
  subscriptions,
}: {
  gymId: string;
  gyms: { id: string; name: string }[];
  subscriptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(createMember, {
    error: null,
    details: null,
    success: false,
    redirectUrl: null
  });

  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting }, 
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      gym_id: gymId,
      subscription_id: undefined,
    },
  });

  const subscriptionId = watch('subscription_id');

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      toast.success('Membre créé avec succès');
      router.push(state.redirectUrl);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <input type="hidden" {...register('gym_id')} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            error={errors.full_name?.message}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={isSubmitting}
          />
        </div>

        {subscriptions.length > 0 && (
          <div className="space-y-2">
            <Label>Abonnement</Label>
            <Select
              value={subscriptionId}
              onValueChange={(value) => setValue('subscription_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun abonnement (accès payant à la séance)" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name} (accès illimité)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('subscription_id')} />
          </div>
        )}
      </div>

       <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}