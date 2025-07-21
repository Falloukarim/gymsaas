"use client";

import { motion } from "framer-motion";

export default function InfiniteScrollingTags() {
  const tags = ["badges virtuels", "scan de QR codes", "gestion des paiements", "revenus en temps réel"];
  const duplicatedTags = [...tags, ...tags];

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex w-max animate-infinite-scroll">
        {duplicatedTags.map((item, i) => (
          <motion.span
            key={i}
            className="mx-2 inline-block whitespace-nowrap px-3 py-1 bg-white/10 rounded-full text-sm font-medium"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
