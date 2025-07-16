import { createClient } from '@/utils/supabase/server';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
export default async function GymsPage() {
  const supabase = createClient();
  
  // Fetch gyms data
  const { data: gyms, error } = await (await supabase)
    .from('gyms')
    .select('id, name, address');

  if (error) {
    return <div>Erreur lors du chargement des salles</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salles de Gym</h1>
        <Button asChild>
          <Link href="/gyms/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer une salle
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {gyms?.map((gym) => (
          <div
            key={gym.id}
            className="p-4 border rounded-lg bg-white text-black hover:bg-gray-100"
          >
            <Link href={`/gyms/${gym.id}`} className="block">
              <h2 className="text-xl font-semibold">{gym.name}</h2>
              <p className="text-sm text-muted-foreground">{gym.address}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}