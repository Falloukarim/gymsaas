import { Suspense } from 'react'
import { LoginPage } from './Login'

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginPage />
    </Suspense>
  )
}
