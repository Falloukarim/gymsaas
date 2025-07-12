import { updateProfile } from './action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Mon Profil</CardTitle>
        </CardHeader>
        <CardContent>
          {searchParams.error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md text-sm">
              {searchParams.error}
            </div>
          )}
          {searchParams.success && (
            <div className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-md text-sm">
              {searchParams.success}
            </div>
          )}
          
          <form action={updateProfile} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input 
                id="email" 
                name="email" 
                defaultValue={user?.email || ''} 
                disabled 
                className="bg-white/10 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">
                Nom complet
              </Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ''}
                required
                className="bg-white/10 border-gray-700 text-white"
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
                className="bg-white/10 border-gray-700 text-white"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}