// src/app/register/page.tsx
import { Suspense } from 'react'
import { RegisterPage } from './Register'

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <RegisterPage />
    </Suspense>
  )
}
