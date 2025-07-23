"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 text-center py-8 text-sm text-gray-400 border-t border-white/10">
      <div className="max-w-4xl mx-auto px-6">
        <p>© 2025 SENGYM. Propulsé par la passion du sport et la puissance du numérique.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="#" className="hover:text-white transition">Conditions d&apos;utilisation</Link>
          <Link href="#" className="hover:text-white transition">Politique de confidentialité</Link>
          <Link href="#" className="hover:text-white transition">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
