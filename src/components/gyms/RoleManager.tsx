'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { USER_ROLES } from '@/lib/constants/role';
import { toast } from 'sonner';

type UserRole = 'owner' | 'admin' | 'staff';

interface UserData {
  email: string;
  full_name?: string;
}

interface GymUser {
  user_id: string;
  role: UserRole;
  users: UserData;
}

interface RoleManagerProps {
  gymId: string;
  currentUserRole: UserRole;
  className?: string;
}

export function RoleManager({ gymId, currentUserRole, className }: RoleManagerProps) {
  const supabase = createClient();
  const [users, setUsers] = useState<GymUser[]>([]);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [loading, setLoading] = useState(true);

  const availableRoles = useCallback((): UserRole[] => {
    if (currentUserRole === 'owner') {
      return ['owner', 'admin', 'staff'];
    }
    return ['admin', 'staff'];
  }, [currentUserRole]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gbus')
        .select(`
          user_id, 
          role, 
          users!inner(
            email,
            full_name
          )
        `)
        .eq('gym_id', gymId)
        .order('role', { ascending: true });

      if (error) throw error;
      
      setUsers((data as unknown as GymUser[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [gymId, supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (newRole !== 'owner') {
      const { count } = await supabase
        .from('gbus')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .eq('role', 'owner');

      if (count === 1) {
        const currentUser = users.find(u => u.user_id === userId);
        if (currentUser?.role === 'owner') {
          toast.error('Un gym doit avoir au moins un owner');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('gbus')
        .update({ role: newRole })
        .eq('gym_id', gymId)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Rôle mis à jour avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Envoi de l\'invitation en cours...');
    
    try {
      // 1. Vérifier si l'utilisateur existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;

      if (user) {
        // 2a. Vérifier si l'utilisateur est déjà dans le gym
        const { data: existing, error: existingError } = await supabase
          .from('gbus')
          .select('user_id')
          .eq('gym_id', gymId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
          throw new Error('Cet utilisateur fait déjà partie de ce gym');
        }

        // Ajouter à gbus
        const { error: gbusError } = await supabase
          .from('gbus')
          .insert({
            gym_id: gymId,
            user_id: user.id,
            role: selectedRole
          });

        if (gbusError) throw gbusError;
        
        toast.success('Utilisateur ajouté au gym avec succès', { id: toastId });
      } else {
        // 2b. Créer une invitation
        const { error: inviteError } = await supabase
          .from('invitations')
          .insert({
            gym_id: gymId,
            email,
            role: selectedRole
          });

        if (inviteError) throw inviteError;
        
        toast.success(`Une invitation a été envoyée à ${email}`, { id: toastId });
      }

      setEmail('');
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error inviting user:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de l'invitation",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex gap-2 flex-col sm:flex-row">
        <Input
          type="email"
          placeholder="Email de l'utilisateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Select 
            value={selectedRole} 
            onValueChange={(value: UserRole) => setSelectedRole(value)}
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
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Membres du gym</h3>
        {loading && users.length === 0 ? (
          <p>Chargement...</p>
        ) : users.length === 0 ? (
          <p>Aucun membre trouvé</p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.user_id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{user.users?.full_name || user.users?.email}</p>
                  <p className="text-sm text-muted-foreground">{user.users?.email}</p>
                </div>
                <Select 
                  value={user.role}
                  onValueChange={(value: UserRole) => updateRole(user.user_id, value)}
                  disabled={loading || (user.role === 'owner' && currentUserRole !== 'owner')}
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
        )}
      </div>
    </div>
  );
}