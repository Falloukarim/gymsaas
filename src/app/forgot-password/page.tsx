"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ✅ Validation Zod
const forgotSchema = z.object({
  email: z.string()
    .min(1, { message: "L'email est obligatoire" })
    .email({ message: "Email invalide" }),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
  });

const onSubmit = async (data: ForgotSchema) => {
  setMessage("");
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      // ✅ URL simple et directe
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    setMessage("Un email de réinitialisation a été envoyé.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      setMessage(error.message);
    } else {
      setMessage("Une erreur est survenue");
    }
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Mot de passe oublié</h2>

        {message && (
          <p className={`mb-4 text-center ${message.includes("envoyé") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        {/* ✅ Champ email avec Controller */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="w-full"
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#00c9a7] hover:bg-[#00a58e] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
        </Button>

        <div className="mt-4 text-center text-sm">
          <Link 
            href="/login" 
            className="text-[#00c9a7] hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
