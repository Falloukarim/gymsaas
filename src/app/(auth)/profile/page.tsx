import { updateProfile } from '@/actions/update-profile';
import { updatePassword } from '@/actions/update-password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage({
  searchParams: resolvedSearchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const searchParams = await resolvedSearchParams;

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
              {searchParams.error}
            </div>
          )}
          {searchParams.success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
              {searchParams.success}
            </div>
          )}

          <form 
            action={async (formData) => {
              'use server';
              const result = await updateProfile(formData);
              if (result?.error) {
                console.error('Profile update error:', result.error);
                return { error: result.error };
              }
              return result;
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white">Nom complet</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={userData?.full_name || ''}
                  required
                  className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="bg-[#0f1f2a]/50 border-gray-700 text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={userData?.phone || ''}
                  className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url" className="text-white">Photo de profil</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="file"
                  accept="image/*"
                  className="bg-[#0f1f2a] border-gray-700 text-white file:bg-[#00c9a7] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
                Enregistrer les modifications
              </Button>
            </div>
          </form>

          <Separator className="my-8 bg-gray-700" />

          <form action={updatePassword} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  name="password"
                  type="password"
                  required
                  className="bg-[#0f1f2a] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  className="bg-[#0f1f2a] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="bg-[#0f1f2a] border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
                Mettre à jour le mot de passe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
