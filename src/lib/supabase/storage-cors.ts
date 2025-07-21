import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Clé avec permissions élevées
);

export async function configureStorageCors() {
  try {
    const { error } = await supabaseAdmin
      .storage
      .setCors({
        allowedOrigins: [
          'http://localhost:3000',
          'https://7a27657ca545.ngrok-free.app',
          'https://votre-site.com'
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['*'],
        maxAgeSeconds: 3600
      });

    if (error) throw error;
    
    console.log('Configuration CORS réussie !');
    return true;
  } catch (error) {
    console.error('Erreur CORS:', error);
    return false;
  }
}