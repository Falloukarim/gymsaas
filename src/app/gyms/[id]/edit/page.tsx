'use client';

import { updateGym } from '@/actions/gyms/update';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useFormState } from 'react-dom';

export default function EditGymPage({ params }: { params: { id: string } }) {
  const [state, formAction] = useFormState(
    async (prevState: { error: string }, formData: FormData) => {
      const result = await updateGym(params.id, formData);
      return { error: result?.error || '' };
    },
    { error: '' }
  );

  return (
    <div className="space-y-6">
      <Link href={`/gyms/${params.id}`} className="flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Retour aux détails
      </Link>

      <h1 className="text-2xl font-bold">Modifier la salle</h1>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la salle</Label>
          <Input id="name" name="name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea id="address" name="address" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>

        {state.error && (
          <div className="text-red-500 text-sm">{state.error}</div>
        )}

        <div className="flex justify-end">
          <Button type="submit">Enregistrer les modifications</Button>
        </div>
      </form>
    </div>
  );
}