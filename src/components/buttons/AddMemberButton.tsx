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
          "0 0 20px rgba(0,201,167,0.7)",
          "0 0 0 rgba(0,0,0,0)"
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#00c9a7] text-white px-4 py-2 rounded-md font-semibold shadow-md focus:outline-none"
    >
      Ajouter un membre
    </motion.button>
  );
}
