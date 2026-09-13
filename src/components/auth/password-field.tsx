"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  showStrength = false,
  strengthLabel,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  strengthLabel?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block" htmlFor={id}>
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-full border border-[#d9e0dc] bg-white pl-11 pr-12 text-sm text-ink placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {showStrength && value ? (
        <span className="mt-1 block px-3 text-xs text-muted">
          Password strength: {strengthLabel}
        </span>
      ) : null}
    </label>
  );
}
