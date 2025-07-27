'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search-bar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useParams } from 'next/navigation';
import { ArrowLeft, Link } from 'lucide-react';

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
        .eq('gym_id', gymId)
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
    <div className="p-4 sm:p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <Link
          href={`/gyms/${gymId}/dashboard`}
          className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="whitespace-nowrap">Retour au dashboard</span>
        </Link>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold">Historique des Accès</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <SearchBar 
  placeholder="Rechercher un membre..." 
  value={searchQuery}
  onChange={setSearchQuery}
  disabled={loading}
/>
          </div>
          
          {/* Table for desktop */}
          <div className="hidden sm:block rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1e3a4b]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Salle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Spinner className="h-5 w-5" />
                        <span>Chargement des historiques...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-white">
                      {searchQuery ? 'Aucun résultat trouvé' : 'Aucun historique disponible'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a2e3a] transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-white font-medium">
                        {log.members?.full_name || 'Visiteur'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-white text-sm">
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-white">
                        {log.gyms?.name || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-white capitalize text-sm">
                        {log.access_method}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
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

          {/* Cards for mobile */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center items-center gap-2 py-8">
                <Spinner className="h-5 w-5" />
                <span>Chargement des historiques...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-4 text-white">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucun historique disponible'}
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-[#0d1a23] rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-white">
                      {log.members?.full_name || 'Visiteur'}
                    </div>
                    <Badge 
                      variant={log.access_granted ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {log.access_granted ? "Validé" : "Refusé"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-white">
                    <div>
                      <span className="text-gray-400">Date: </span>
                      {new Date(log.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      <span className="text-gray-400">Méthode: </span>
                      <span className="capitalize">{log.access_method}</span>
                    </div>
                    {log.gyms?.name && (
                      <div>
                        <span className="text-gray-400">Salle: </span>
                        {log.gyms.name}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}