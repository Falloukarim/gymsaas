"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const resetSchema = z.object({
  password: z.string().min(6, { message: "Mot de passe trop court" }),
});

type ResetSchema = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetSchema) => {
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Mot de passe mis à jour.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01012b] to-[#02125e]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Réinitialiser mot de passe</h2>

        {message && <p className="mb-4 text-green-600 text-center">{message}</p>}

        <div className="mb-6">
          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </form>
    </div>
  );
}
