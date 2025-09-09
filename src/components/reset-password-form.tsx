"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const resetSchema = z.object({
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
  code: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetSchema = z.infer<typeof resetSchema>;

export default function ResetPasswordForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      code: code || "",
    },
  });

  const onSubmit = async (data: ResetSchema) => {
    setIsLoading(true);
    setMessage("");

    try {
      if (!data.code) {
        setMessage("Code de réinitialisation manquant");
        return;
      }

      const supabase = createClient();
      
      // Échanger le code contre une session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(data.code);

      if (sessionError) {
        setMessage("Lien invalide ou expiré: " + sessionError.message);
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Mot de passe mis à jour avec succès !");
      
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login?message=password_reset_success");
      }, 2000);
    } catch (error: any) {
      setMessage(error.message || "Erreur lors de la mise à jour du mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  if (!code) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black text-center">
        <h2 className="text-2xl font-bold mb-6">Lien invalide</h2>
        <p className="text-red-500 mb-4">Code de réinitialisation manquant</p>
        <Button 
          onClick={() => router.push("/forgot-password")}
          className="bg-[#00c9a7] hover:bg-[#00a58e] text-white"
        >
          Demander un nouveau lien
        </Button>
      </div>
    );
  }

  return (
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

      <input type="hidden" {...register("code")} />

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
        disabled={isLoading}
      >
        {isLoading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
      </Button>
    </form>
  );
}