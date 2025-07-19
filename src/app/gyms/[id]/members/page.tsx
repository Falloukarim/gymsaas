import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const gymId = resolvedParams.id;

  const supabase = createClient();

  // Récupérer la liste des membres avec leurs abonnements
  const { data: members, error } = await (await supabase)
    .from('members')
    .select(`
      *,
      member_subscriptions (
        *,
        subscriptions (type)
      )
    `)
    .eq('gym_id', gymId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error(error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membres</h1>
          <p className="text-muted-foreground">
            Gestion des membres de votre salle de sport
          </p>
        </div>
        <Button asChild>
          <Link href={`/gyms/${gymId}/members/new`} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un membre
          </Link>
        </Button>
      </div>

     <Card className="bg-gray-900 text-white border-none">
        <CardHeader>
          <CardTitle>Liste des membres</CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const activeSubscription = member.member_subscriptions?.find(
                  (sub: any) => new Date(sub.end_date) > new Date()
                );

                return (
                  <Link
                    key={member.id}
                    href={`/gyms/${gymId}/members/${member.id}`}
                    className="group"
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="">
                            {member.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary">
                            {member.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.email || 'Aucun email'}
                          </p>
                        </div>
                        {activeSubscription && (
                          <Badge variant="secondary" className="ml-2">
                            {activeSubscription.subscriptions?.type}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">
                Aucun membre n'est enregistré dans cette salle
              </p>
              <Button asChild variant="link" className="text-primary">
                <Link href={`/gyms/${gymId}/members/new`}>
                  Ajouter votre premier membre
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}