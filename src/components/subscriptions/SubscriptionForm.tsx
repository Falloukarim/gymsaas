'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubscription } from '@/actions/subscriptions/create';
import { updateSubscription } from '@/actions/subscriptions/update';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.number().min(0.01),
  duration_days: z.number().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof subscriptionSchema>;

export function SubscriptionForm({
  gymId,
  initialData,
}: {
  gymId: string;
  initialData?: Partial<FormData> & { id?: string };
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append('gym_id', gymId);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });

      const result = initialData?.id
        ? await updateSubscription(initialData.id, formData)
        : await createSubscription(formData);

      if (result?.error) throw new Error(result.error);

      toast.success(
        initialData?.id ? 'Subscription updated' : 'Subscription created'
      );
      router.push('/subscriptions');
    } catch (error) {
      toast.error('Operation failed');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
        </div>
        <div>
          <Label htmlFor="duration_days">Duration (days)</Label>
          <Input
            id="duration_days"
            type="number"
            {...register('duration_days', { valueAsNumber: true })}
            error={errors.duration_days?.message}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={3}
        />
      </div>

      <Button type="submit" loading={isSubmitting}>
        {initialData?.id ? 'Update' : 'Create'} Subscription
      </Button>
    </form>
  );
}