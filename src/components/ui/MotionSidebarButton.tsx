"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

interface MotionSidebarButtonProps extends MotionProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export default function MotionSidebarButton({
  children,
  isActive = false,
  className = "",
  ...props
}: MotionSidebarButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full ${className}`}
      {...props}
    >
      <InteractiveHoverButton
        className={`flex items-center gap-2 px-3 py-2 rounded w-full transition-all
          ${isActive ? "bg-[#00c9a7] text-white shadow-[0_0_10px_#00c9a7]" : "text-gray-300 hover:bg-[#00c9a7]/30 hover:text-white"}
        `}
      >
        {children}
      </InteractiveHoverButton>
    </motion.div>
  );
}
