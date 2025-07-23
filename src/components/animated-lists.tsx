"use client";

import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: string;
  members: {
    full_name: string;
  };
  subscriptions: {
    name: string;
  };
  end_date: string;
  amount: number;
  start_date: string;
}

interface Entry {
  id: string;
  members: {
    full_name: string;
  };
  access_granted: boolean;
  timestamp: string;
}

interface AnimatedSubscriptionsProps {
  subscriptions: Subscription[];
  gymId?: string; // Marked as optional since it's not used
}

interface AnimatedEntriesProps {
  entries: Entry[];
  gymId?: string; // Marked as optional since it's not used
}

export function AnimatedSubscriptions({ subscriptions }: AnimatedSubscriptionsProps) {
  return (
    <div className="space-y-4">
      {subscriptions?.map((sub, index) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-white">{sub.members.full_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-400">{sub.subscriptions.name}</p>
              <Badge 
                variant={
                  new Date(sub.end_date) > new Date() ? "default" : "destructive"
                }
                className="text-xs"
              >
                {new Date(sub.end_date) > new Date() ? "Actif" : "Expiré"}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-white">€{sub.amount}</p>
            <p className="text-sm text-gray-400">
              {new Date(sub.start_date).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function AnimatedEntries({ entries }: AnimatedEntriesProps) {
  return (
    <div className="space-y-4">
      {entries?.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-white">{entry.members.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={entry.access_granted ? "default" : "destructive"}
              className="text-xs"
            >
              {entry.access_granted ? "Validé" : "Refusé"}
            </Badge>
            <div className="text-right">
              <p className="text-sm text-white">
                {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}