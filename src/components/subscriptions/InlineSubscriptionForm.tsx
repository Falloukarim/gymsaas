'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'mensuel', label: 'Mensuel', defaultDays: 30 },
  { value: 'trimestriel', label: 'Trimestriel', defaultDays: 90 },
  { value: 'semestriel', label: 'Semestriel', defaultDays: 180 },
  { value: 'annuel', label: 'Annuel', defaultDays: 365 }
];

export default function InlineSubscriptionForm({ gymId, onSuccess }: { gymId: string; onSuccess: () => void }) {
  const supabase = createClientComponentClient();
  const [form, setForm] = useState({
    type: '',
    price: '',
    duration: '30',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (value: string) => {
    const selectedType = TYPE_OPTIONS.find(opt => opt.value === value);
    setForm({
      ...form,
      type: value,
      duration: selectedType?.defaultDays.toString() || '30'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.type || !form.price) {
      toast.error('Veuillez sélectionner un type et un prix');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          gym_id: gymId,
          type: form.type,
          price: parseFloat(form.price),
          duration_days: parseInt(form.duration),
          description: form.description || null,
          is_session: false
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      toast.success('Abonnement créé avec succès');
      setForm({ type: '', price: '', duration: '30', description: '' });
      onSuccess();
    } catch (error) {
      console.error('Full error:', error);
      toast.error(error instanceof Error ? error.message : "Erreur inconnue lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-gray-700">Type d'abonnement *</Label>
        <Select value={form.type} onValueChange={handleTypeChange} required>
          <SelectTrigger className="bg-gray-500">
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
        <Label className="text-gray-700">Prix (FCFA) *</Label>
        <Input
          type="number"
          min="0"
          step="100"
          value={form.price}
          onChange={(e) => setForm({...form, price: e.target.value})}
          placeholder="Ex: 15000"
          className="bg-gray-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Durée (jours)</Label>
        <Input
          type="number"
          min="1"
          value={form.duration}
          className="bg-gray-500"
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Description (optionnelle)</Label>
        <Input
          type="text"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Description courte"
          className="bg-gray-500"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : 'Créer l\'abonnement'}
        </Button>
      </div>
    </form>
  );
}