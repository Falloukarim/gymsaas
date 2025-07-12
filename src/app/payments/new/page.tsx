'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  duration_days: number;
}

export default function NewPaymentPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    type: 'session', // 'session' ou 'subscription'
    amount: '',
    sessionDate: new Date().toISOString().split('T')[0],
    subscriptionId: '',
    paymentMethod: 'cash',
    status: 'paid'
  });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        // Charger les membres
        const { data: membersData } = await supabase
          .from('members')
          .select('id, full_name, email, phone')
          .order('full_name', { ascending: true });

        // Charger les abonnements disponibles
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select('id, name, price, duration_days')
          .order('price', { ascending: true });

        setMembers(membersData || []);
        setSubscriptions(subscriptionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const handleMemberChange = (memberId: string) => {
    const member = members.find(m => m.id === memberId) || null;
    setSelectedMember(member);
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      amount: type === 'subscription' && subscriptions.length > 0 
        ? subscriptions[0].price.toString() 
        : prev.amount
    }));
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    const selectedSub = subscriptions.find(s => s.id === subscriptionId);
    setFormData(prev => ({
      ...prev,
      subscriptionId,
      amount: selectedSub ? selectedSub.price.toString() : prev.amount
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember) {
      toast.error('Veuillez sélectionner un membre');
      return;
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      toast.error('Veuillez saisir un montant valide');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const paymentData = {
        member_id: selectedMember.id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        payment_method: formData.paymentMethod,
        status: formData.status,
        subscription_id: formData.type === 'subscription' ? formData.subscriptionId : null,
        session_date: formData.type === 'session' ? formData.sessionDate : null
      };

      const { error } = await supabase.from('payments').insert(paymentData);

      if (error) throw error;

      toast.success('Paiement enregistré avec succès');
      router.push('/payments');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Le paiement n'a pas pu être enregistré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nouveau Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Sélection du membre */}
              <div className="space-y-2">
                <Label htmlFor="member">Membre *</Label>
                <Select 
                  onValueChange={handleMemberChange}
                  disabled={fetchingData}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fetchingData ? "Chargement..." : "Sélectionnez un membre"} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} ({member.email || member.phone || 'Pas de contact'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de paiement */}
              <div className="space-y-2">
                <Label>Type de paiement *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Séance unique</SelectItem>
                    <SelectItem value="subscription">Abonnement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Champs conditionnels selon le type */}
              {formData.type === 'subscription' && (
                <>
                  <div className="space-y-2">
                    <Label>Abonnement *</Label>
                    <Select 
                      value={formData.subscriptionId} 
                      onValueChange={handleSubscriptionChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un abonnement" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptions.map(sub => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name} - {sub.price}€ ({sub.duration_days} jours)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.type === 'session' && (
                <div className="space-y-2">
                  <Label htmlFor="sessionDate">Date de la séance</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Montant */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Méthode de paiement */}
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="transfer">Virement</SelectItem>
                    <SelectItem value="check">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/payments')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !selectedMember}>
                {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}