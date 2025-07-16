import { updateProfile } from './action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { updatePassword } from '@/actions/update-password'

export default async function ProfilePage({
  searchParams: resolvedSearchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  // 🔹 Résoudre searchParams
  const searchParams = await resolvedSearchParams;

  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  const { data: profile } = await (await supabase)
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl bg-[#00c9a7]">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white">
                    {profile?.full_name || 'Utilisateur'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <Badge variant="outline" className="border-[#00c9a7] text-[#00c9a7]">
                  {user?.role || 'Membre'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle className="text-lg">Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Compte
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Sécurité
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles
              </CardDescription>
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

              <form action={updateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">
                      Nom complet
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile?.full_name || ''}
                      required
                      className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      defaultValue={user?.email || ''} 
                      disabled 
                      className="bg-[#0f1f2a]/50 border-gray-700 text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      className="bg-[#0f1f2a] border-gray-700 text-white focus:border-[#00c9a7] focus:ring-[#00c9a7]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url" className="text-white">
                      Photo de profil
                    </Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      type="file"
                      className="bg-[#0f1f2a] border-gray-700 text-white file:bg-[#00c9a7] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                    />
                  </div>
                </div>

                <CardFooter className="flex justify-end gap-4 px-0 pb-0 pt-6">
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
                  >
                    Enregistrer les modifications
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>

          {/* Additional Security Section */}
          <Card className="border-gray-700 bg-[#0d1a23] mt-6">
  <CardHeader>
    <CardTitle>Changer le mot de passe</CardTitle>
  </CardHeader>
  <Separator className="bg-gray-700" />
  <CardContent className="pt-6">
    <form action={updatePassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input
          id="currentPassword"
          name="password"
          type="password"
          required
          className="bg-[#0f1f2a] border-gray-700 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
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
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="bg-[#0f1f2a] border-gray-700 text-white"
        />
      </div>
      <Button 
        type="submit" 
        className="bg-[#00c9a7] hover:bg-[#00a58e] text-white mt-4"
      >
        Mettre à jour le mot de passe
      </Button>
    </form>
  </CardContent>
</Card>
        </div>
      </div>
    </div>
  )
}