'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/search-bar';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const supabase = createClient();
      let query = supabase
        .from('access_logs')
        .select(`
          id,
          timestamp,
          access_granted,
          access_method,
          gyms(name),
          members(full_name)
        `)
        .order('timestamp', { ascending: false });

      if (searchQuery) {
        query = query.ilike('members.full_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [searchQuery]);

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Historique des Accès</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <SearchBar 
              placeholder="Rechercher une entrée..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1e3a4b]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Membre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Salle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Méthode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      Chargement...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-white">
                      Aucune entrée trouvée
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a2e3a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        {log.members?.full_name || 'Inconnu'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {log.gyms?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {log.access_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={log.access_granted ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.access_granted ? "Validé" : "Refusé"}
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