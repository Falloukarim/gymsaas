'use client';

import { motion } from 'framer-motion';
import { RevenueChart } from './revenue-chart';

export function AnimatedRevenueChart({
  data,
  totalAmount,
  changePercentage,
}: {
  data: { date: string; amount: number }[];
  totalAmount: number;
  changePercentage: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <RevenueChart
        data={data}
        totalAmount={totalAmount}
        changePercentage={changePercentage}
      />
    </motion.div>
  );
}
