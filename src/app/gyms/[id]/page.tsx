'use client';

import { createClient } from '@/lib/supabaseClient'; // Changé de '/server' à '/client'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Users } from 'lucide-react';
import { deleteGym } from '@/actions/gyms/delete';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@/components/LoadingButton';

export default function GymDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const router = useRouter();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [gym, setGym] = useState<any>(null);
  const [membersCount, setMembersCount] = useState(0);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupération de l'utilisateur
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);

        if (user) {
          // Vérification du rôle owner
          const { data: userRole, error: roleError } = await supabase
            .from('gbus')
            .select('role')
            .eq('user_id', user.id)
            .eq('gym_id', id)
            .maybeSingle();
          
          if (roleError) throw roleError;
          setIsOwner(userRole?.role === 'owner');
        }

        // Récupération des autres données
        const [
          { data: gymData, error: gymError },
          { count: members, error: membersError },
          { count: subscriptions, error: subsError }
        ] = await Promise.all([
          supabase.from('gyms').select('*').eq('id', id).single(),
          supabase.from('members').select('*', { count: 'exact' }).eq('gym_id', id),
          supabase.from('member_subscriptions')
            .select('*', { count: 'exact' })
            .eq('gym_id', id)
            .gt('end_date', new Date().toISOString())
        ]);

        if (gymError) throw gymError;
        if (membersError) throw membersError;
        if (subsError) throw subsError;

        setGym(gymData);
        setMembersCount(members || 0);
        setSubscriptionsCount(subscriptions || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, supabase]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteGym(id);
      router.push('/gyms');
    } catch (error) {
      console.error('Error deleting gym:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMember = () => {
    setIsAddingMember(true);
    router.push(`/members/new?gym_id=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold">Salle non trouvée</h2>
        <Link href="/gyms" className="mt-4 text-blue-600 hover:underline">
          Retour à la liste des salles
        </Link>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/gyms" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux salles</span>
        </Link>
        
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href={`/admin/roles/${id}`} className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les accès
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href={`/gyms/${id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>

              <form action={handleDelete}>
                <LoadingButton 
                  variant="destructive" 
                  type="submit"
                  isLoading={isDeleting}
                  loadingText="Suppression..."
                >
                  Supprimer
                </LoadingButton>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{gym.name}</h3>
                <p className="text-sm text-muted-foreground">{gym.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm text-muted-foreground">{gym.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium">Membres</p>
                <p className="text-2xl font-bold">{membersCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Abonnements actifs</p>
                <p className="text-2xl font-bold">{subscriptionsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoadingButton
              className="w-full"
              isLoading={isAddingMember}
              onClick={handleAddMember}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un membre
            </LoadingButton>
            
            <Button asChild variant="outline" className="w-full">
              <Link href={`/subscriptions/new?gym_id=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un abonnement
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Derniers membres</span>
              <Link href={`/members?gym_id=${id}`} className="text-sm font-normal">
                Voir tous
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste des membres */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Abonnements disponibles</span>
              <Link href={`/subscriptions?gym_id=${id}`} className="text-sm font-normal">
                Voir tous
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Liste des abonnements */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}