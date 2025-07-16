'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMember } from '@/actions/members/create';

const memberSchema = z.object({
  gym_id: z.string().min(1, 'Salle requise'),
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(6, 'Minimum 6 caractères'),
  subscription_id: z.string().optional()
});

export function MemberForm({
  gymId,
  subscriptions,
}: {
  gymId: string;
subscriptions: { id: string; type: string; price?: number }[];
}) {
  const router = useRouter();

  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting }, 
    setValue,
    watch,
  } = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      gym_id: gymId,
      full_name: '',
      email: '',
      phone: '',
      subscription_id: undefined,
    },
  });

  const subscriptionId = watch('subscription_id');

  const onSubmit = async (data: z.infer<typeof memberSchema>) => {
  try {
    const formData = new FormData();
    formData.append('gym_id', data.gym_id);
    formData.append('full_name', data.full_name);
    formData.append('phone', data.phone);
    if (data.email) formData.append('email', data.email);
    if (data.subscription_id) formData.append('subscription_id', data.subscription_id);

    const result = await createMember(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Membre créé avec succès');
    
    // Redirection vers la page détail du membre
    if (result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      router.push(`/gyms/${gymId}/dashboard`);
    }
  } catch (error) {
    toast.error('Erreur lors de la création du membre');
    console.error(error);
  }
};

   console.log('Données passées à MemberForm:', {
  gymId,
  subscriptions,
  subscriptionsCount: subscriptions?.length
});

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un abonnement" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((sub) => (
  <SelectItem key={sub.id} value={sub.id}>
    {sub.type} {sub.price ? `(€${sub.price})` : ''}
  </SelectItem>
))}
              </SelectContent>
            </Select>
            {errors.subscription_id && (
              <p className="text-sm text-red-500">{errors.subscription_id.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push(`/gyms/${gymId}/dashboard`)}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}