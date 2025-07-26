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
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { compressImage } from '../../../utils/imageCompression';
import { Loader2 } from 'lucide-react';

// Constantes pour la validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const memberSchema = z.object({
  gym_id: z.string().min(1, 'Salle requise'),
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(6, 'Minimum 6 caractères'),
  subscription_id: z.string().optional(),
  avatar: z
    .any()
    .refine(file => !file || file.size <= MAX_FILE_SIZE, {
      message: `La taille maximale est de ${MAX_FILE_SIZE / 1024 / 1024}MB`
    })
    .refine(
      file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      `Formats acceptés: ${ACCEPTED_IMAGE_TYPES.map(t => t.replace('image/', '.')).join(', ')}`
    )
});

export function MemberForm({
  gymId,
  subscriptions,
}: {
  gymId: string;
  subscriptions: { id: string; type: string; price?: number; is_session?: boolean }[];
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting }, 
    setValue,
    watch,
    trigger
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
  const fullName = watch('full_name');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`Format non supporté. Utilisez ${ACCEPTED_IMAGE_TYPES.map(t => t.replace('image/', '.')).join(', ')}`);
      return;
    }

    setIsCompressing(true);
    
    try {
      const compressedFile = await compressImage(file);
      setValue('avatar', compressedFile);
      trigger('avatar');

      // Aperçu de l'image compressée
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Erreur de compression:', error);
      toast.error('Échec de la compression de l\'image');
    } finally {
      setIsCompressing(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof memberSchema>) => {
    setIsUploading(true);
    const toastId = toast.loading('Création du membre en cours...');

    try {
      const formData = new FormData();
      formData.append('gym_id', data.gym_id);
      formData.append('full_name', data.full_name);
      formData.append('phone', data.phone);
      
      if (data.email) formData.append('email', data.email);
      if (data.subscription_id) formData.append('subscription_id', data.subscription_id);
      if (data.avatar) formData.append('avatar', data.avatar);

      const result = await createMember(formData);

      toast.success('Membre ajouté avec succès', {
        id: toastId,
        description: `${data.full_name} a été enregistré`,
        action: {
          label: 'Voir',
          onClick: () => router.push(`/gyms/${gymId}/members/${result.memberId}`)
        },
      });

      router.push(result.redirectUrl || `/gyms/${gymId}/dashboard`);
    } catch (error) {
      toast.error('Erreur lors de la création du membre', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('gym_id')} />

      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 cursor-pointer" onClick={triggerFileInput}>
            {preview ? (
              <AvatarImage src={preview} alt="Preview" className="object-cover" />
            ) : (
              <AvatarFallback className="text-2xl bg-gray-100">
                {fullName ? fullName.split(' ').map(n => n[0]).join('') : '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer" onClick={triggerFileInput}>
            <span className="text-white text-sm font-medium">Changer</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
        />
        <p className="mt-2 text-sm text-gray-500">Cliquez sur l&apos;avatar pour changer la photo</p>
        {isCompressing && (
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Compression en cours...
          </div>
        )}
        {errors.avatar && (
          <p className="mt-1 text-sm text-red-500">{errors.avatar.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            error={errors.full_name?.message}
            disabled={isSubmitting || isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={isSubmitting || isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={isSubmitting || isUploading}
          />
        </div>

        {subscriptions.length > 0 && (
          <div className="space-y-2">
            <Label>Type d&apos;accès</Label>
            <Select
              value={subscriptionId}
              onValueChange={(value) => setValue('subscription_id', value)}
              disabled={isSubmitting || isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type d&apos;accès" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.is_session 
                      ? `Session: ${sub.description || 'Accès journée'} (${sub.price} FCFA)`
                      : `Abonnement ${sub.type} (${sub.price} FCFA)`}
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
          disabled={isSubmitting || isUploading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading}
        >
          {(isSubmitting || isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}