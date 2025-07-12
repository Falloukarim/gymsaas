// components/gym/RoleManager.tsx
'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export function RoleManager({ gymId }: { gymId: string }) {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('gbus')
      .select('*, users(*)')
      .eq('gym_id', gymId);

    if (error) {
      toast.error('Erreur de chargement');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [gymId]);

  const updateRole = async (userId: string, newRole: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('gbus')
      .update({ role: newRole })
      .eq('gym_id', gymId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Erreur de mise à jour');
      console.error(error);
    } else {
      toast.success('Rôle mis à jour');
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));
    }
    setLoading(false);
  };

  const inviteUser = async () => {
    if (!email) return;
    
    setLoading(true);
    // 1. Trouver l'utilisateur par email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      toast.error('Utilisateur non trouvé');
      setLoading(false);
      return;
    }

    // 2. Créer l'association (par défaut staff)
    const { error } = await supabase
      .from('gbus')
      .insert({
        gym_id: gymId,
        user_id: user.id,
        role: 'staff'
      });

    if (error) {
      toast.error('Erreur lors de l\'invitation');
      console.error(error);
    } else {
      toast.success('Utilisateur ajouté');
      setEmail('');
      fetchUsers();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Email de l'utilisateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Button onClick={inviteUser} disabled={loading}>
          Inviter
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Membres du gym</h3>
        {users.map(user => (
          <div key={user.user_id} className="flex items-center gap-4 p-2 border rounded">
            <span className="flex-1">
              {user.users?.email} 
            </span>
            <Select 
              value={user.role}
              onValueChange={(value) => updateRole(user.user_id, value)}
              disabled={loading}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}