import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function configureStorageCors() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/storage/cors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      },
      body: JSON.stringify({
        allowed_origins: [
          'http://localhost:3000',
          'https://7a27657ca545.ngrok-free.app',
          'https://votre-site.com'
        ],
        allowed_methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowed_headers: ['*'],
        max_age_seconds: 3600
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Configuration CORS réussie !');
    return true;
  } catch (error) {
    console.error('Erreur CORS:', error);
    return false;
  }
}