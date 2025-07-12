"use client";

import { Badge, BadgeProps } from "@/components/ui/badge";

type Status = "paid" | "pending" | "failed";

interface PaymentStatusBadgeProps extends BadgeProps {
  status: Status;
}

export function PaymentStatusBadge({ status, ...props }: PaymentStatusBadgeProps) {
  const statusMap: Record<Status, { label: string; variant: BadgeProps["variant"] }> = {
    paid: { label: "Payé", variant: "default" },
    pending: { label: "En attente", variant: "secondary" },
    failed: { label: "Échoué", variant: "destructive" },
  };

  return (
    <Badge variant={statusMap[status].variant} {...props}>
      {statusMap[status].label}
    </Badge>
  );
}