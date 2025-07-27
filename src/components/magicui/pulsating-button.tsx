import React from "react";
import { cn } from "@/lib/utils";

interface PulsatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: string;
  pulseIntensity?: number;
}

export const PulsatingButton = React.forwardRef<HTMLButtonElement, PulsatingButtonProps>(
  (
    {
      className,
      children,
      duration = "1.5s",
      pulseIntensity = 0.4,
      style,
      ...props
    },
    ref
  ) => {
    const customStyle = {
      ...style,
      '--duration': duration,
      '--pulse-intensity': pulseIntensity,
    } as React.CSSProperties;

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground",
          className,
        )}
        style={customStyle}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div
          className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-lg"
          style={{ opacity: 'var(--pulse-intensity)' }}
        />
      </button>
    );
  }
);

PulsatingButton.displayName = "PulsatingButton";
