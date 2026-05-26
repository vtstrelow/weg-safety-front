import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-ink bg-ink text-white shadow-sm hover:bg-black",
  secondary: "border-line bg-white text-ink shadow-sm hover:border-ink hover:bg-neutral-50",
  ghost: "border-transparent bg-transparent text-muted hover:bg-black/5 hover:text-ink",
  danger: "border-red-800 bg-red-700 text-white shadow-sm hover:bg-red-800"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
