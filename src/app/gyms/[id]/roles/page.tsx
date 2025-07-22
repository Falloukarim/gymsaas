import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RoleManager } from "@/components/gyms/RoleManager";
import { USER_ROLES } from "@/lib/constants/role";

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des rôles</h1>
      <RoleManager gymId={params.id} currentUserRole={currentUserRole} />
    </div>
  );
}
