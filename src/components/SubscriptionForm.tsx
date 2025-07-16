'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const TYPE_OPTIONS = [
  { value: 'mensuel', label: 'Mensuel', defaultDays: 30 },
  { value: 'annuel', label: 'Annuel', defaultDays: 365 }
];

type FormData = {
  type: string;
  price: string;
  duration: string;
};

export default function SubscriptionForm({ gymId, onSuccess }: { gymId: string; onSuccess: () => void }) {
  const [form, setForm] = useState<FormData>({
    type: '',
    price: '',
    duration: '30'
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (value: string) => {
    const selectedType = TYPE_OPTIONS.find(opt => opt.value === value);
    setForm({
      type: value,
      price: form.price,
      duration: selectedType?.defaultDays.toString() || '30'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Submitting with gymId:", gymId);

  if (!gymId) {
    toast.error("Aucune salle sélectionnée.");
    return;
  }

  setLoading(true);
  
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        gym_id: gymId,
        type: form.type,
        price: parseFloat(form.price),
        duration_days: parseInt(form.duration)
      });

    if (error) throw error;

    toast.success('Abonnement créé avec succès');
    setForm({ type: '', price: '', duration: '30' });
    setIsOpen(false);
    onSuccess();
  } catch (err: any) {
    console.error('Erreur création abonnement:', err);
    toast.error(err.message || "Erreur lors de la création de l'abonnement");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Ajouter un abonnement</Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nouvel abonnement</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type d'abonnement *</Label>
                <Select 
                  value={form.type} 
                  onValueChange={handleTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prix (€) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  placeholder="Ex: 39.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Durée (jours)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={(e) => setForm({...form, duration: e.target.value})}
                  disabled
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
