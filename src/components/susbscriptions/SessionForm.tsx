'use client'
import { createSessionSubscription } from '@/actions/subscriptions/create'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react';
export default function SessionForm({ 
  gymId,
  onSuccess 
}: { 
  gymId: string
  onSuccess: () => void
}) {
const [state, formAction] = useActionState(createSessionSubscription, null);

  return (
    <form 
      action={async (formData) => {
        await formAction(formData)
        onSuccess()
      }}
      className="space-y-4"
    >
      <input type="hidden" name="gym_id" value={gymId} />
      
      <div className="space-y-2">
        <Label htmlFor="price">Prix (FCFA)</Label>
        <Input
          type="number"
          id="price"
          name="price"
          min="0"
          step="500"
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

      <Button type="submit">Créer ce type de session</Button>

      {state?.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
    </form>
  )
}