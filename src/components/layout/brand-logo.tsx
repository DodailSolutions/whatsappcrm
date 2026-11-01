import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "Dodail";
export const PRODUCT_NAME = "Dodail CRM";

// The Dodail roundel (public/logo.png) — white disc with the orange
// ring and navy wordmark. It is already circular with its own white
// ground, so it reads on both light and dark surfaces; the hairline
// ring just keeps it from bleeding into a white card in light mode.
export function BrandMark({
  size = 32,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={BRAND_NAME}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "shrink-0 rounded-full bg-white ring-1 ring-black/5",
        className,
      )}
    />
  );
}

// Logo + product name lockup used in the sidebar header.
export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={34} priority />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          {BRAND_NAME}
          <span className="text-primary">.</span>
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          WhatsApp CRM
        </span>
      </span>
    </span>
  );
}

// Logo shown above the card on the signed-out screens (login, signup,
// password reset, invite join).
export function AuthBrand() {
  return (
    <Link
      href="/"
      aria-label={PRODUCT_NAME}
      className="rounded-full shadow-lg shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BrandMark size={72} priority />
    </Link>
  );
}
