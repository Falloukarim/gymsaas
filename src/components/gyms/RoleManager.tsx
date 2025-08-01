'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    return currentUserRole === 'owner'
      ? ['owner', 'admin', 'staff']
      : ['admin', 'staff'];
  }, [currentUserRole]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gbus')
        .select('user_id, role, users!inner(email, full_name)')
        .eq('gym_id', gymId)
        .order('role', { ascending: true });

      if (error) throw error;
      setUsers((data as GymUser[]) || []);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [gymId]);

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
        const currentUser = users.find((u) => u.user_id === userId);
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
      console.error(error);
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
    const toastId = toast.loading("Envoi de l'invitation...");

    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (user) {
        const { data: existing } = await supabase
          .from('gbus')
          .select('user_id')
          .eq('gym_id', gymId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) throw new Error('Cet utilisateur est déjà membre.');

        const { error: gbusError } = await supabase
          .from('gbus')
          .insert({ gym_id: gymId, user_id: user.id, role: selectedRole });

        if (gbusError) throw gbusError;

        toast.success('Utilisateur ajouté au gym', { id: toastId });
      } else {
        const { error: inviteError } = await supabase
          .from('invitations')
          .insert({ gym_id: gymId, email, role: selectedRole });

        if (inviteError) throw inviteError;
        toast.success(`Invitation envoyée à ${email}`, { id: toastId });
      }

      setEmail('');
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur pendant l’invitation', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <Input
          type="email"
          placeholder="Email de l'utilisateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full sm:w-auto flex-1"
        />
        <Select
          value={selectedRole}
          onValueChange={(value: UserRole) => setSelectedRole(value)}
          disabled={loading}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles().map((role) => (
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
        <h3 className="font-semibold text-lg">Membres du gym</h3>
        {loading && users.length === 0 ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground">Aucun membre trouvé</p>
        ) : (
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.user_id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted rounded-xl border transition-shadow hover:shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <div>
                  <p className="font-medium">{user.users?.full_name || user.users?.email}</p>
                  <p className="text-sm text-muted-foreground">{user.users?.email}</p>
                </div>
                <Select
                  value={user.role}
                  onValueChange={(value: UserRole) => updateRole(user.user_id, value)}
                  disabled={loading || (user.role === 'owner' && currentUserRole !== 'owner')}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles().map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
