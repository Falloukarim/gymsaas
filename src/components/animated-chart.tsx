"use client";

import { motion } from 'framer-motion';
import { RevenueChart } from "./revenue-chart";

export function AnimatedRevenueChart({ gymId }: { gymId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <RevenueChart gymId={gymId} data={[]} />
    </motion.div>
  );
}