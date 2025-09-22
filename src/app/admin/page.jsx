// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

// Mot de passe administrateur (à changer en production)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "motdepassepar défaut";

export default function AdminDashboard() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [stats, setStats] = useState({
    totalGyms: 0,
    activeSubscriptions: 0,
    trialGyms: 0,
    expiredSubscriptions: 0
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
      setAuthenticated(true);
      fetchGymsData();
    }
  }, []);

  const handleLogin = (e) => {
  e.preventDefault();
  if (password === ADMIN_PASSWORD) {
    setAuthenticated(true);
    setPasswordError(false);
    sessionStorage.setItem('adminAuthenticated', 'true');
    fetchGymsData();
  } else {
    setPasswordError(true);
  }
};


  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setPassword("");
  };

  const fetchGymsData = async () => {
    try {
      setLoading(true);
      const { data: gymsData, error: gymsError } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });

      if (gymsError) throw gymsError;

      const gymsWithStats = await Promise.all(
        gymsData.map(async (gym) => {
          const { count: membersCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gym.id);

          const { count: activeMembersCount } = await supabase
            .from('member_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('gym_id', gym.id)
            .eq('status', 'active')
            .gt('end_date', new Date().toISOString());

          return {
            ...gym,
            members_count: membersCount || 0,
            active_members_count: activeMembersCount || 0
          };
        })
      );

      setGyms(gymsWithStats || []);

      const now = new Date();

      const activeSubscriptions = gymsWithStats.filter(gym =>
        gym.subscription_active === true &&
        gym.current_subscription_end &&
        new Date(gym.current_subscription_end) > now
      ).length;

      const trialGyms = gymsWithStats.filter(gym =>
        gym.trial_end_date &&
        new Date(gym.trial_end_date) > now &&
        (gym.subscription_active === false || !gym.current_subscription_end || new Date(gym.current_subscription_end) <= now)
      ).length;

      const expiredSubscriptions = gymsWithStats.filter(gym =>
        gym.subscription_active === true &&
        gym.current_subscription_end &&
        new Date(gym.current_subscription_end) <= now
      ).length;

      setStats({
        totalGyms: gymsWithStats.length,
        activeSubscriptions,
        trialGyms,
        expiredSubscriptions
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert("Erreur ❌: Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGymStatus = async (gymId, currentStatus, isTrialActive, gymName) => {
    try {
      if (!currentStatus) {
        // Activation
        const { data: subscription, error: subscriptionError } = await supabase
          .from('gym_subscriptions')
          .insert({
            gym_id: gymId,
            plan_id: 'monthly_basic',
            name: 'Abonnement Mensuel de Base',
            description: 'Abonnement mensuel standard',
            price: 25000,
            currency: 'XOF',
            billing_cycle: 'monthly',
            status: 'active',
            is_trial: false
          })
          .select()
          .single();

        if (subscriptionError) throw subscriptionError;

        const { error: paymentError } = await supabase
          .from('gym_subscription_payments')
          .insert({
            gym_id: gymId,
            subscription_id: subscription.id,
            payment_id: 'pay_' + Math.random().toString(36).substring(2),
            amount: 25000,
            currency: 'XOF',
            status: 'completed',
            payment_method: 'admin',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (paymentError) throw paymentError;

        const updateData = {
          subscription_active: true,
          current_subscription_id: subscription.id,
          current_subscription_start: new Date().toISOString(),
          current_subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        if (isTrialActive) updateData.trial_used = true;

        const { error: gymError } = await supabase
          .from('gyms')
          .update(updateData)
          .eq('id', gymId);

        if (gymError) throw gymError;

      } else {
        // Désactivation
        const { error } = await supabase
          .from('gyms')
          .update({
            subscription_active: false,
            current_subscription_id: null,
            current_subscription_start: null,
            current_subscription_end: null
          })
          .eq('id', gymId);

        if (error) throw error;
      }

      fetchGymsData();
      alert(`La salle ${gymName} a été ${currentStatus ? "désactivée" : "activée"} avec succès.`);

      // Jouer un son de notification
      try {
        const audio = new Audio("/sounds/notify.mp3");
        audio.play();
      } catch (e) {
        console.log("Impossible de jouer le son", e);
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert("Erreur ❌: " + (error.message || "Une erreur est survenue."));
    }
  };

  const extendTrial = async (gymId, days = 7) => {
    try {
      const gym = gyms.find(g => g.id === gymId);
      if (!gym) return;

      const currentDate = gym.trial_end_date ? new Date(gym.trial_end_date) : new Date();
      const newTrialEndDate = new Date(currentDate.setDate(currentDate.getDate() + days));

      const { error } = await supabase
        .from('gyms')
        .update({
          trial_end_date: newTrialEndDate.toISOString(),
          trial_used: false,
          subscription_active: false,
          current_subscription_id: null,
          current_subscription_start: null,
          current_subscription_end: null
        })
        .eq('id', gymId);

      if (error) throw error;

      alert(`Succès ✅: La période d'essai de ${gym.name} a été prolongée de ${days} jours.`);

      fetchGymsData();
    } catch (error) {
      console.error('Erreur prolongation:', error);
      alert("Erreur ❌: " + (error.message || "Impossible de prolonger la période d'essai."));
    }
  };

  // Afficher le formulaire de connexion si non authentifié
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Accès Administrateur</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe administrateur
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez le mot de passe"
                autoComplete="current-password"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">Mot de passe incorrect</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Barre de déconnexion */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Déconnexion
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de Bord Administrateur</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Salles</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalGyms}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Abonnements Actifs</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Essais Actifs</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.trialGyms}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Abonnements Expirés</h3>
            <p className="text-3xl font-bold text-red-600">{stats.expiredSubscriptions}</p>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={fetchGymsData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Rafraîchir les données
          </button>
        </div>

        {/* Tableau des salles */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Liste des Salles de Sport</h2>
            <p className="text-sm text-gray-600">{gyms.length} salles trouvées</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin Abonnement/Essai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gyms.length > 0 ? gyms.map(gym => {
                  const now = new Date();
                  const isTrialActive = gym.trial_end_date && new Date(gym.trial_end_date) > now;
                  const isSubscriptionActive = gym.subscription_active && gym.current_subscription_end && new Date(gym.current_subscription_end) > now;

                  return (
                    <tr key={gym.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                        <div className="text-sm text-gray-500">{gym.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{gym.city || 'Non spécifiée'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{gym.active_members_count} / {gym.members_count}</div>
                        <div className="text-sm text-gray-500">Actifs/Total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${isSubscriptionActive ? 'bg-green-100 text-green-800' : isTrialActive ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {isSubscriptionActive ? 'Abonnement Actif' : isTrialActive ? 'Essai Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gym.current_subscription_end
                          ? `Abonnement: ${new Date(gym.current_subscription_end).toLocaleDateString()}`
                          : gym.trial_end_date
                          ? `Essai: ${new Date(gym.trial_end_date).toLocaleDateString()}`
                          : 'Aucun'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* Bouton activer/désactiver avec confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className={`mr-2 ${isSubscriptionActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                            >
                              {isSubscriptionActive ? "Désactiver" : "Activer"}
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer l'action</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir {isSubscriptionActive ? "désactiver" : "activer"} 
                                <span className="font-semibold"> {gym.name}</span> ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleGymStatus(gym.id, isSubscriptionActive, isTrialActive, gym.name)}
                              >
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Bouton prolonger essai */}
                        {isTrialActive && (
                          <button
                            onClick={() => extendTrial(gym.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Prolonger essai
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucune salle de sport trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}