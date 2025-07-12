"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const signupSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Mot de passe trop court" }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupSchema) => {
    setError("");
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/dashboard"; // Redirige après signup
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>

        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

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

        <div className="mb-6">
          <Input
            type="password"
            placeholder="Mot de passe"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </Button>

        <p className="mt-4 text-center text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
