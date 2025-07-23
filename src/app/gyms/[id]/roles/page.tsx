import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RoleManager } from "@/components/gyms/RoleManager";
import { USER_ROLES } from "@/lib/constants/role";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function RolesPage({
  params: resolvedParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await resolvedParams;

  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  const { data } = await (await supabase)
    .from("gbus")
    .select("role")
    .eq("gym_id", params.id)
    .eq("user_id", user?.id)
    .single();

  const currentUserRole = data?.role;

  // Vérifie l'autorisation
  if (![USER_ROLES.OWNER, USER_ROLES.ADMIN].includes(currentUserRole)) {
    redirect(`/gyms/${params.id}/dashboard`);
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Link
                href={`/gyms/${params.id}/dashboard`}
                className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour au dashboard</span>
              </Link>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Gestion des rôles
              </CardTitle>
            </div>
            {currentUserRole === USER_ROLES.OWNER && (
              <Button asChild variant="outline">
                <Link href={`/gyms/${params.id}/settings`}>
                  Paramètres avancés
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-lg border dark:border-gray-700 p-4 sm:p-6">
            <RoleManager 
              gymId={params.id} 
              currentUserRole={currentUserRole} 
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}