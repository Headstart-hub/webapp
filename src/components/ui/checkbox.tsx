"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center space-x-3 cursor-pointer group",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "relative flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
          checked
            ? "border-transparent bg-blue-600"
            : "border-gray-300 bg-white group-hover:border-gray-400",
          disabled && "border-gray-200 bg-gray-50"
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className="text-sm font-medium text-gray-700 select-none">
        {label}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  );
}
