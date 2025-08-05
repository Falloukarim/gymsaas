'use client';

import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LoadingButton } from '@/components/LoadingButton';

function MembersPage() {
  const params = useParams();
  const gymId = params.id as string;
  const [members, setMembers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  if (!gymId) {
    console.error('gymId is missing');
    return null;
  }

  const getAvatarUrl = (url: string | null): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(url.split('/').pop() || '');
      
    return data?.publicUrl || '';
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from('members')
          .select(`
            *,
            member_subscriptions (
              *,
              subscriptions (type)
            )
          `)
          .eq('gym_id', gymId)
          .ilike('full_name', `%${search}%`)
          .order('full_name', { ascending: true });

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setInitialLoading(false);
        setSearchLoading(false);
      }
    };

    fetchMembers();
  }, [gymId, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setSearch(formData.get('q') as string);
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${url}`;
    return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
  };

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

        <div className="relative p-6 sm:p-8 rounded-2xl border bg-white shadow-md">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-400 via-green-100 to-green-900 blur-sm opacity-50 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Membres</h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Gestion des membres de votre salle de sport
            </p>
            <Link href={`/gyms/${gymId}/members/new`} passHref>
              <LoadingButton 
                className="px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition-all shadow-md"
                isLoading={isAddingMember}
                onClick={() => setIsAddingMember(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </LoadingButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Search field */}
      <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 items-center">
        <input
          type="text"
          name="q"
          placeholder="Rechercher un membre..."
          defaultValue={search}
          className="w-full p-2 rounded-md border bg-white text-black text-sm sm:text-base"
        />
        <LoadingButton 
          type="submit" 
          variant="secondary" 
          size="icon" 
          className="shrink-0"
          isLoading={searchLoading}
          loadingText="Recherche..."
        >
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
        </LoadingButton>
      </form>

      {/* Members list */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Liste des membres</CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : members.length > 0 ? (
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
                    <Card className="transition-all hover:scale-[1.02] hover:shadow-lg border border-gray-200">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage src={getImageUrl(member.avatar_url)} />
                          <AvatarFallback className="bg-green-500 text-white">
                            {member.full_name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-green-600">
                            {member.full_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {member.email || 'Aucun email'}
                          </p>
                        </div>
                        {activeSubscription && (
                          <Badge variant="secondary" className="ml-2 text-xs sm:text-sm bg-green-100 text-green-800">
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
              <p className="text-gray-500 text-sm sm:text-base">
                Aucun membre trouvé {search && `pour "${search}"`}
              </p>
              <Button asChild variant="link" className="text-green-600">
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
};

export default MembersPage;