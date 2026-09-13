import Image from "next/image";
import { cn } from "@/lib/utils";

export function FunaabCrest({
  className,
  size = 88,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/images/funaab-crest.png"
      alt="FUNAAB crest"
      width={size}
      height={size}
      className={cn("mx-auto object-contain", className)}
      priority
    />
  );
}
