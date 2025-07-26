import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Users } from 'lucide-react'
import { deleteGym } from '@/actions/gyms/delete'

type Params = Promise<{ id: string }> // ✅ indique que params est une Promise

export default async function GymDetailPage({ params }: { params: Params }) {
  const resolvedParams = await params // ✅ attends params avant de l'utiliser
  const { id } = resolvedParams

const supabase = await createClient();

  // Récupération de l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()

  // Vérification du rôle owner
  const isOwner = false
  if (user) {
 const { data: userRole, error: roleError } = await supabase
  .from('gbus')
  .select('role')
  .eq('user_id', user.id)
  .eq('gym_id', id)
  .maybeSingle();

console.log('Debug requête role:', {
  userId: user.id,
  gymId: id,
  userRole,
  roleError,
  query: `select role from gbus where user_id='${user.id}' and gym_id='${id}'`
});

  // Récupération des autres données en parallèle
  const [
    { data: gym },
    { count: membersCount },
    { count: subscriptionsCount }
  ] = await Promise.all([
    supabase.from('gyms').select('*').eq('id', id).single(),
    supabase.from('members').select('*', { count: 'exact' }).eq('gym_id', id),
    supabase.from('member_subscriptions').select('*', { count: 'exact' })
      .eq('gym_id', id)
      .gt('end_date', new Date().toISOString())
  ])

  if (!gym) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold">Salle non trouvée</h2>
        <Link href="/gyms" className="mt-4 text-blue-600 hover:underline">
          Retour à la liste des salles
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    'use server'
    await deleteGym(id)
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
                <Button variant="destructive" type="submit">
                  Supprimer
                </Button>
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
                <p className="text-2xl font-bold">{membersCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Abonnements actifs</p>
                <p className="text-2xl font-bold">{subscriptionsCount || 0}</p>
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
              <Button asChild className="w-full">
                <Link href={`/members/new?gym_id=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un membre
                </Link>
              </Button>
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
  )
}}
