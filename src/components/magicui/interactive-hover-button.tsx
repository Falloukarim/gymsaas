import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Fond gris foncé + bord + texte vert
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border border-gray-700 bg-gray-800 p-2 px-6 text-center font-semibold text-[#00c9a7] transition-colors duration-300 hover:bg-gray-700",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 relative z-10">
        {/* Petit point vert animé */}
        <div className="h-2 w-2 rounded-full bg-[#00c9a7] transition-all duration-300 group-hover:scale-[100.8]"></div>
        {/* Texte initial qui glisse */}
        <span className="inline-block transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0">
          {children}
        </span>
      </div>

      {/* Arrière animation : texte + flèche visible au hover */}
      <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center gap-2 text-[#00c9a7] transition-all duration-300 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 z-0">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
