import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; success?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  const { data: userData } = await (await supabase)
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="w-full min-h-screen p-6 bg-[#0b161f]">
      <Card className="w-full h-full bg-[#0d1a23] border-none shadow-none">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData?.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-[#00c9a7]">
                {userData?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {userData?.full_name || 'Utilisateur'}
              </h3>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <Badge variant="outline" className="mt-2 border-[#00c9a7] text-[#00c9a7]">
                {userData?.role || 'Membre'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <Separator className="bg-gray-700" />

        <CardContent className="pt-6">
          {searchParams.error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}
          {searchParams.success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
              {decodeURIComponent(searchParams.success)}
            </div>
          )}

          <ProfileForm user={user} userData={userData} gymId={params.id} />

          <Separator className="my-8 bg-gray-700" />
        </CardContent>
      </Card>
    </div>
  );
}