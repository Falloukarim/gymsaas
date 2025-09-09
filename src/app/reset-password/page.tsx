import { Suspense } from 'react';
import ResetPasswordForm from '@/components/reset-password-form';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <Suspense fallback={
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-black">Chargement...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}