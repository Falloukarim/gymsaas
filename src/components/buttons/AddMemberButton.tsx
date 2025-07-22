"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Props {
  gymId: string;
}

export function AddMemberButton({ gymId }: Props) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push(`/gyms/${gymId}/members/new`)}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 rgba(0,0,0,0)",
          "0 0 10px rgba(0,201,167,0.5)", // Réduit l'intensité de l'ombre
          "0 0 0 rgba(0,0,0,0)"
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{ scale: 1.05 }} // Réduit l'effet hover
      whileTap={{ scale: 0.95 }}
      className="bg-[#00c9a7] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium sm:font-semibold text-sm sm:text-base shadow-md focus:outline-none"
    >
      Ajouter un membre
    </motion.button>
  );
}