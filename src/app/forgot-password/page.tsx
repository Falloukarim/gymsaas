"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotSchema) => {
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: "http://localhost:3000/reset-password",
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Un email de réinitialisation a été envoyé.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Mot de passe oublié</h2>

        {message && <p className="mb-4 text-green-600 text-center">{message}</p>}

        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Envoi..." : "Réinitialiser"}
        </Button>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
