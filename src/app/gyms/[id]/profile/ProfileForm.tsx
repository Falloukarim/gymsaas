'use client';

import { updateProfile } from '@/actions/update-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

export function ProfileForm({
  user,
  userData,
  gymId,
}: {
  user: any;
  userData: any;
  gymId: string;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateProfile, null);

  useEffect(() => {
    if (state?.success) {
      router.push(`/gyms/${gymId}/profile?success=${encodeURIComponent(state.success)}`);
    } else if (state?.error) {
      router.push(`/gyms/${gymId}/profile?error=${encodeURIComponent(state.error)}`);
    }
  }, [state, router, gymId]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-white">
            Nom complet
          </Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={userData?.full_name || ''}
            required
            className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            defaultValue={user?.email || ''}
            disabled
            className="bg-[#0f1f2a]/50 border-gray-700 text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">
            Téléphone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={userData?.phone || ''}
            className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar_url" className="text-white">
            Photo de profil
          </Label>
          <Input
            id="avatar_url"
            name="avatar_url"
            type="file"
            accept="image/*"
            className="bg-[#0f1f2a] border-gray-700 text-white file:bg-[#00c9a7] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
        >
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}