"use client";

import { Badge, BadgeProps } from "@/components/ui/badge";

type Status = "active" | "expired" | "pending";

interface SubscriptionStatusBadgeProps extends BadgeProps {
  status: Status;
}

export function SubscriptionStatusBadge({ status, ...props }: SubscriptionStatusBadgeProps) {
  const statusMap: Record<Status, { label: string; variant: BadgeProps["variant"] }> = {
    active: { label: "Actif", variant: "default" },
    expired: { label: "Expiré", variant: "destructive" },
    pending: { label: "En attente", variant: "secondary" },
  };

  return (
    <Badge variant={statusMap[status].variant} {...props}>
      {statusMap[status].label}
    </Badge>
  );
}