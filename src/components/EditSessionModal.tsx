'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface EditSessionModalProps {
  session: any;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EditSessionModal({ session, onSuccess, onClose }: EditSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: session.type || '',
    price: session.price || '',
    description: session.description || ''
  });
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { error } = await supabase
        .from('subscriptions')
        .update({
          type: formData.type,
          price: Number(formData.price),
          description: formData.description
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Session modifiée avec succès');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Erreur lors de la modification', {
        description: error.message || 'Veuillez réessayer'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Modifier la session</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type" className="text-gray-700">Nom de la session</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
              className="bg-white text-gray-800 border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-gray-700">Prix (FCFA)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              className="bg-white text-gray-800 border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-white text-gray-800 border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}