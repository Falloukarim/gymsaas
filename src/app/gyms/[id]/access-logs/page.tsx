'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search-bar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Spinner from '@/components/ui/spinner';
import { useParams } from 'next/navigation';

interface AccessLog {
  id: string;
  timestamp: string;
  access_granted: boolean;
  access_method: string;
  gyms: { name: string } | null;
  members: { full_name: string } | null;
}

export default function AccessLogsPage() {
  const { id: gymId } = useParams();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClientComponentClient();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('access_logs')
        .select(`
          id,
          timestamp,
          access_granted,
          access_method,
          gyms(name),
          members!inner(full_name)
        `)
        .eq('gym_id', gymId) // Filtre par salle de sport
        .order('timestamp', { ascending: false });

      if (searchQuery.trim()) {
        query = query.ilike('members.full_name', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data as unknown as AccessLog[] || []);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      toast.error('Erreur lors du chargement des historiques');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, gymId]);

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Historique des Accès</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <SearchBar 
              placeholder="Rechercher un membre..." 
              value={searchQuery}
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1e3a4b]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Salle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Spinner className="h-5 w-5" />
                        <span>Chargement des historiques...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      {searchQuery ? 'Aucun résultat trouvé' : 'Aucun historique disponible'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a2e3a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {log.members?.full_name || 'Visiteur'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {log.gyms?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white capitalize">
                        {log.access_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={log.access_granted ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.access_granted ? "Accès validé" : "Accès refusé"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}