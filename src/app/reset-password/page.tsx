// src/app/reset-password/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
export const dynamic = 'force-dynamic';

const resetSchema = z.object({
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetSchema = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    const handleResetPassword = async () => {
      try {
        setIsLoading(true);
        const code = searchParams.get('code');
        
        if (!code) {
          setMessage("Code de réinitialisation manquant");
          setIsReady(false);
          return;
        }

        // Utiliser le client Supabase pour le navigateur
        const supabase = createClient();
        
        // Échanger le code contre une session
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Erreur d'échange de code:", error);
          setMessage("Lien invalide ou expiré: " + error.message);
          setIsReady(false);
          return;
        }

        if (session) {
          setIsReady(true);
          setMessage("");
          console.log("Session établie avec succès");
        } else {
          setMessage("Échec de l'établissement de la session");
          setIsReady(false);
        }

      } catch (error: any) {
        console.error("Erreur inattendue:", error);
        setMessage("Erreur lors du traitement du lien: " + error.message);
        setIsReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    handleResetPassword();
  }, [searchParams]);

  const onSubmit = async (data: ResetSchema) => {
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setMessage("Mot de passe mis à jour avec succès !");
      
      // Déconnexion et redirection après succès
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login?message=password_reset_success");
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || "Erreur lors de la mise à jour du mot de passe");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-black">Traitement du lien de réinitialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Réinitialiser le mot de passe
        </h2>

        {message && (
          <p className={`mb-4 text-center ${
            message.includes("succès") ? "text-green-600" : "text-red-500"
          }`}>
            {message}
          </p>
        )}

        {isReady ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Nouveau mot de passe
              </label>
              <Input
                type="password"
                placeholder="Entrez votre nouveau mot de passe"
                {...register("password")}
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Confirmer le mot de passe
              </label>
              <Input
                type="password"
                placeholder="Confirmez votre nouveau mot de passe"
                {...register("confirmPassword")}
                className="w-full"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#00c9a7] hover:bg-[#00a58e] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
            </Button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">{message}</p>
            <Button 
              onClick={() => router.push("/forgot-password")}
              className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
            >
              Demander un nouveau lien
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}