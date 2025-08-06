"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { ArrowUpRight, Ticket, Tickets } from "lucide-react";
import { Users, CreditCard, Euro, Activity, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

// Dans animated-cards.tsx
type Stat = {
  name: string;
  value: string;
  iconName: "Users" | "CreditCard" | "Euro" | "Activity" | "Clock" | "Ticket" | "Tickets";
  change: string;
  changeType: "positive" | "negative";
  description?: string;
};

const iconMap = {
  Users,
  CreditCard,
  Euro,
  Activity,
  Clock,
  Ticket, // Ajouté
  Tickets, // Ajouté
};

export function AnimatedCards({ stats }: { stats: Stat[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((_, index) => (
          <Card key={index} className="bg-[#0d1a23] border-gray-700 min-h-[120px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.iconName];

        return (
          <motion.div
            key={index}
            className="w-full"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              layout
            >
              <Card className="bg-[#0d1a23] border-gray-700 min-h-[120px]">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center mb-2">
                    <div className="rounded-md bg-[#00c9a7]/20 p-2">
                      <Icon className="h-4 w-4 text-[#00c9a7]" />
                    </div>
                    <h3 className="text-xs font-medium text-gray-300 ml-2 text-center line-clamp-2">
                      {stat.name}
                    </h3>
                  </div>

                  <div className="mt-auto text-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stat.value}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                          type: "spring",
                          bounce: 0.4,
                          duration: 0.4,
                        }}
                        className="text-xl font-semibold text-white text-center truncate"
                      >
                        {stat.value}
                      </motion.p>
                    </AnimatePresence>

                    <div
                      className={`flex items-center justify-center mt-1 text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      <ArrowUpRight
                        className={`h-3 w-3 ${
                          stat.changeType === "positive" ? "" : "rotate-180"
                        }`}
                      />
                      <span className="ml-1">{stat.change}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
