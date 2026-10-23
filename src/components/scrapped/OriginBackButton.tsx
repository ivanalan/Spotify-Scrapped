"use client";

import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import { originBack } from "@/lib/origin-back";

type Props = Omit<ComponentPropsWithoutRef<"button">, "type" | "onClick"> & {
  /** Cold-entry target when there is no prior in-tab path (D-040). */
  fallbackHref?: string;
};

/**
 * ← Back that returns to the prior in-app screen (D-040).
 * Cold open uses `fallbackHref` (default `/`).
 */
export function OriginBackButton({
  fallbackHref = "/",
  children,
  ...rest
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => originBack(router, fallbackHref)}
      {...rest}
    >
      {children}
    </button>
  );
}
