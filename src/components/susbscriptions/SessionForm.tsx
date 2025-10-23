'use client'
import { createSessionSubscription } from '@/actions/subscriptions/create'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'

export default function SessionForm({ 
  gymId,
  onSuccess 
}: { 
  gymId: string
  onSuccess: () => void
}) {
  const [state, formAction] = useFormState(createSessionSubscription, {
    error: undefined,
    success: false,
    data: undefined
  });

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form 
      action={formAction}
      className="space-y-4"
    >
      <input type="hidden" name="gym_id" value={gymId} />
      <input type="hidden" name="duration_days" value="1" />
      
      <div className="space-y-2">
        <Label htmlFor="price">Prix (FCFA)</Label>
        <Input
          type="number"
          id="price"
          name="price"
          min="0"
          step="50"
          defaultValue="5000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          type="text"
          id="description"
          name="description"
          placeholder="Ex: Accès journée, Cours particulier..."
          required
        />
      </div>

      <SubmitButton />

      {state?.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
      
      {state?.success && (
        <p className="text-green-500 text-sm mt-2">Session créée avec succès !</p>
      )}
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Création...' : 'Créer ce type de session'}
    </Button>
  );
}