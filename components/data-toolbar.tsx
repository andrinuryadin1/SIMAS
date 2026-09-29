"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  param: string;
  label: string;
  options: FilterOption[];
}

interface DataToolbarProps {
  basePath: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  className?: string;
}

export function DataToolbar({
  basePath,
  searchPlaceholder = "Cari...",
  filters = [],
  className,
}: DataToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("search", e.target.value);
    else params.delete("search");
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleFilterChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(basePath);
  };

  const hasAnyFilter = currentSearch || filters.some((f) => searchParams.get(f.param));

  return (
    <div className={`flex flex-wrap gap-4 items-end ${className ?? ""}`}>
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-10"
          value={currentSearch}
          onChange={handleSearchChange}
        />
      </div>

      {filters.map((filter) => {
        const currentValue = searchParams.get(filter.param) ?? "";
        return (
          <DropdownMenu key={filter.param}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filter.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-sm" onClick={() => handleFilterChange(filter.param, "")}>
                Semua {filter.label}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {filter.options.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className="text-sm"
                  onClick={() => handleFilterChange(filter.param, opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {hasAnyFilter && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="mr-1 h-3.5 w-3.5" />
          Hapus Filter
        </Button>
      )}
    </div>
  );
}