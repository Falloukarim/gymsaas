'use client';

import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Calendar, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingButton } from '@/components/LoadingButton';

function MembersPage() {
  const params = useParams();
  const router = useRouter();
  const gymId = params.id as string;
  const [members, setMembers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [search, setSearch] = useState('');
  const [navigatingMemberId, setNavigatingMemberId] = useState<string | null>(null);
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
  
  const handleMemberClick = (memberId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setNavigatingMemberId(memberId);
    router.push(`/gyms/${gymId}/members/${memberId}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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
      <div className="relative p-6 sm:p-8 rounded-2xl border bg-white shadow-md">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-400 via-green-100 to-green-900 blur-sm opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Liste des membres</CardTitle>
            </CardHeader>
            <CardContent>
              {initialLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              ) : members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {members.map((member) => {
                    const activeSubscription = member.member_subscriptions?.find(
                      (sub: any) => new Date(sub.end_date) > new Date()
                    );

                    const initials = member.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <Link
                        key={member.id}
                        href={`/gyms/${gymId}/members/${member.id}`}
                        className="group block"
                        onClick={(e) => handleMemberClick(member.id, e)}
                      >
                        <Card
                          className={`h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200 bg-white rounded-xl overflow-hidden ${
                            navigatingMemberId === member.id
                              ? 'opacity-70 pointer-events-none'
                              : ''
                          }`}
                        >
                          <CardContent className="p-5">
                            {navigatingMemberId === member.id ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                            ) : (
                              <>
                                {/* Header avec avatar et statut */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-14 w-14 ring-2 ring-green-500/20 border-2 border-white shadow-md">
                                      <AvatarImage
                                        src={getImageUrl(member.avatar_url)}
                                        className="object-cover h-full w-full"
                                      />
                                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-green-700 transition-colors">
                                        {member.full_name}
                                      </h3>
                                      {activeSubscription && (
                                        <Badge
                                          variant="secondary"
                                          className="mt-1 text-xs bg-green-100 text-green-800 border-green-200"
                                        >
                                          Abonnement actif
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Informations de contact */}
                                <div className="space-y-3">
                                  {member.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <span className="truncate">{member.email}</span>
                                    </div>
                                  )}

                                  {member.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Phone className="h-4 w-4" />
                                      <span>{member.phone}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Membre depuis {formatDate(member.created_at)}</span>
                                  </div>
                                </div>

                                {/* Badge de navigation */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                                      Voir le profil
                                    </span>
                                    <div className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                                      <svg className="w-full h-full text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-base">
                    Aucun membre trouvé {search && `pour "${search}"`}
                  </p>
                  <Button asChild variant="link" className="text-green-600">
                    <Link href={`/gyms/${gymId}/members/new`}>Ajouter le premier membre</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MembersPage;