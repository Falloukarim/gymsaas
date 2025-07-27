"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function SearchBar({ placeholder, value, onChange, disabled }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(value || searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (onChange) {
      onChange(query);
    }
    
    if (debouncedQuery) {
      router.push(`?q=${debouncedQuery}`);
    } else {
      router.push("");
    }
  }, [debouncedQuery, router, query, onChange]);

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 bg-white/10 border-gray-700 text-white placeholder-gray-400 focus-visible:ring-[#00c9a7]"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (onChange) {
            onChange(e.target.value);
          }
        }}
        disabled={disabled}
      />
    </div>
  );
}