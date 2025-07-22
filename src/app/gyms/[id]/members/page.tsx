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
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: { q?: string };
}) {
  const resolvedParams = await params;
  const gymId = resolvedParams.id;
  const search = searchParams?.q || '';

  const supabase = createClient();

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
    .ilike('full_name', `%${search}%`) // recherche insensible à la casse
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

      {/* Champ de recherche */}
       <form method="GET" className="max-w-md flex gap-2 items-center">
  <input
    type="text"
    name="q"
    placeholder="Rechercher un membre..."
    defaultValue={search}
    className="w-full p-2 rounded-md border bg-white text-black"
  />
  <Button type="submit" variant="secondary" size="icon" className="shrink-0">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
      />
    </svg>
    <span className="sr-only">Rechercher</span>
  </Button>
</form>

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
                          <AvatarFallback>
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
                Aucun membre trouvé {search && `pour "${search}"`}
              </p>
              <Button asChild variant="link" className="text-primary">
                <Link href={`/gyms/${gymId}/members/new`}>
                  Ajouter un membre
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
