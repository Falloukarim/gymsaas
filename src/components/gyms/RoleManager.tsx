// components/gym/RoleManager.tsx
'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { USER_ROLES } from '@/lib/constants/role';

interface GymUser {
  user_id: string;
  role: string;
  users: {
    email: string;
  };
}

interface RoleManagerProps {
  gymId: string;
  currentUserRole: string;
}

export function RoleManager({ gymId, currentUserRole }: RoleManagerProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.STAFF);
  const [loading, setLoading] = useState(true);

  // Rôles disponibles en fonction du rôle actuel
  const availableRoles = useCallback(() => {
    if (currentUserRole === USER_ROLES.OWNER) {
      return Object.values(USER_ROLES);
    }
    return [USER_ROLES.ADMIN, USER_ROLES.STAFF];
  }, [currentUserRole]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('gbus')
      .select('*, users(email)')
      .eq('gym_id', gymId);

    if (error) {
      toast.error('Erreur de chargement');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, [gymId, supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    // Empêcher la modification du dernier owner
    if (newRole !== USER_ROLES.OWNER) {
      const { count } = await supabase
        .from('gbus')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .eq('role', USER_ROLES.OWNER);

      if (count === 1) {
        const currentUser = users.find(u => u.user_id === userId);
        if (currentUser?.role === USER_ROLES.OWNER) {
          toast.error('Un gym doit avoir au moins un owner');
          return;
        }
      }
    }

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
      fetchUsers();
    }
    setLoading(false);
  };

  const inviteUser = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // 1. Vérifier si l'utilisateur existe
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (user) {
        // Utilisateur existe - ajouter directement à gbus
        const { error } = await supabase
          .from('gbus')
          .insert({
            gym_id: gymId,
            user_id: user.id,
            role: selectedRole
          });

        if (error) throw error;
        toast.success('Utilisateur ajouté au gym');
      } else {
        // Utilisateur n'existe pas - créer une invitation
        const { error } = await supabase
          .from('invitations')
          .insert({
            gym_id: gymId,
            email,
            role: selectedRole
          });

        if (error) throw error;
        
        toast.success(`Invitation envoyée à ${email}`);
      }

      setEmail('');
      fetchUsers();
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Erreur lors de l&apos;invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Email de l&apos;utilisateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Select 
          value={selectedRole} 
          onValueChange={setSelectedRole}
          disabled={loading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles().map(role => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              disabled={loading || (user.role === USER_ROLES.OWNER && currentUserRole !== USER_ROLES.OWNER)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}