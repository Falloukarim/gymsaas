import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCronDryRun() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  console.log('=== DÉBUT DU TEST DRY-RUN AUTONOME ===');
  console.log('Date actuelle:', now.toISOString());
  console.log('Date du jour (minuit):', today.toISOString());

  try {
    // 1. Créer un gym de test avec date d'expiration passée
    console.log('\n1. Création d\'un gym de test...');
    
    const testGym = {
      name: 'GYM_TEST_DRY_RUN',
      subdomain: `test-dry-run-${Date.now()}`,
      subscription_status: 'active',
      subscription_end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      address: 'Adresse test',
      phone: '+1234567890'
    };

    const { data: gym, error: gymError } = await supabase
      .from('organizations')
      .insert(testGym)
      .select()
      .single();

    if (gymError) throw gymError;
    console.log('✅ Gym de test créé:', gym.id, gym.name);

    // 2. Créer un client de test
    console.log('\n2. Création d\'un client de test...');
    
    const testClient = {
      organization_id: gym.id,
      nom: 'CLIENT_TEST_DRY_RUN',
      telephone: '+1234567890',
      email: 'test@dry-run.com',
      created_at: new Date().toISOString()
    };

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
      .single();

    if (clientError) throw clientError;
    console.log('✅ Client de test créé:', client.id, client.nom);

    // 3. Créer une commande expirée pour le client
    console.log('\n3. Création d\'une commande expirée...');
    
    const testCommande = {
      organization_id: gym.id,
      client_id: client.id,
      statut: 'en_cours',
      poids: 10,
      prix_kg: 5,
      numero_commande: `TEST-${Date.now()}`,
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 jours
      updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    };

    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert(testCommande)
      .select()
      .single();

    if (commandeError) throw commandeError;
    console.log('✅ Commande de test créée:', commande.id);

    // 4. Simuler le traitement du cron
    console.log('\n4. Simulation du traitement cron...');
    
    // Simulation gyms
    const { data: expiringGyms } = await supabase
      .from('organizations')
      .select('id, name, subscription_status, subscription_end_date')
      .or('subscription_status.eq.active,subscription_status.eq.trial')
      .lte('subscription_end_date', today.toISOString());

    console.log(`📊 ${expiringGyms?.length || 0} gyms seraient désactivés`);
    
    // Simulation membres/commandes
    const { data: expiringCommands } = await supabase
      .from('commandes')
      .select('id, client_id, clients(nom)')
      .lte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq('statut', 'en_cours');

    console.log(`📊 ${expiringCommands?.length || 0} commandes seraient expirées`);

    // 5. Nettoyage
    console.log('\n5. Nettoyage des données de test...');
    
    await supabase.from('commandes').delete().eq('id', commande.id);
    await supabase.from('clients').delete().eq('id', client.id);
    await supabase.from('organizations').delete().eq('id', gym.id);

    console.log('✅ Données de test nettoyées');

    return {
      success: true,
      stats: {
        gyms_would_be_deactivated: expiringGyms?.length || 0,
        commands_would_be_expired: expiringCommands?.length || 0,
        test_data_created: 3,
        test_data_cleaned: true
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Exécution du script
testCronDryRun().then(result => {
  console.log('\n=== RÉSULTAT DU TEST ===');
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});