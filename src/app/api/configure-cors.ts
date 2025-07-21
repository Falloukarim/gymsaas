import { NextApiRequest, NextApiResponse } from 'next';
import { configureStorageCors } from '@/lib/supabase/storage-cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const success = await configureStorageCors();
  res.status(success ? 200 : 500).json({ success });
}