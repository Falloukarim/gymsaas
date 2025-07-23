import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';

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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href={`/gyms/${gymId}/dashboard`}
          className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="whitespace-nowrap">Retour au dashboard</span>
        </Link>

        <div className="order-first sm:order-none text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Membres</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestion des membres de votre salle de sport
          </p>
        </div>
        
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/gyms/${gymId}/members/new`} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Ajouter un membre</span>
          </Link>
        </Button>
      </div>

      {/* Search field */}
      <form method="GET" className="w-full max-w-md flex gap-2 items-center">
        <input
          type="text"
          name="q"
          placeholder="Rechercher un membre..."
          defaultValue={search}
          className="w-full p-2 rounded-md border bg-white text-black text-sm sm:text-base"
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

      {/* Members list */}
      <Card className="bg-gray-900 text-white border-none">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Liste des membres</CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary">
                            {member.full_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {member.email || 'Aucun email'}
                          </p>
                        </div>
                        {activeSubscription && (
                          <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">
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
            <div className="text-center py-8 sm:py-12 space-y-2">
              <p className="text-muted-foreground text-sm sm:text-base">
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