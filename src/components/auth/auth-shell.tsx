import Image from "next/image";
import Link from "next/link";
import { FunaabCrest } from "@/components/brand/funaab-crest";
import { APP_FOOTER_MOTTO, APP_TAGLINE, UNIVERSITY_NAME } from "@/lib/constants";

export function AuthShell({
  backgroundSrc,
  cornerHref,
  cornerLabel,
  cornerAction,
  children,
}: {
  backgroundSrc: string;
  cornerHref: string;
  cornerLabel: string;
  cornerAction: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Image
        src={backgroundSrc}
        alt="FUNAAB campus entrance"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-white/20 to-[#eef6ef]" />

      <div className="absolute right-4 top-4 z-20 text-right text-[11px] leading-4 text-white drop-shadow sm:right-8 sm:top-6 sm:text-xs">
        <p className="text-white/90">{cornerLabel}</p>
        <Link
          href={cornerHref}
          className="font-semibold text-white underline-offset-2 hover:underline"
        >
          {cornerAction}
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-end px-3 pb-4 pt-20 sm:justify-center sm:px-4 sm:py-10">
        <section className="auth-card animate-fade-up rounded-[2rem] px-5 pb-5 pt-6 sm:rounded-[2.4rem] sm:px-8 sm:pb-7 sm:pt-8">
          <header className="text-center">
            <FunaabCrest size={78} />
            <p className="mt-3 text-[1.65rem] font-semibold tracking-[0.28em] text-funaab sm:text-[1.85rem]">
              FUNAAB
            </p>
            <p className="mt-1 text-[9px] font-medium tracking-[0.18em] text-funaab/90 sm:text-[10px]">
              {UNIVERSITY_NAME}
            </p>
            <p className="mt-1 text-[11px] text-muted">{APP_TAGLINE}</p>
          </header>
          {children}
        </section>
        <p className="mt-4 flex items-center justify-center gap-2 text-[10px] tracking-[0.22em] text-funaab/80">
          <span aria-hidden>🌿</span>
          {APP_FOOTER_MOTTO}
        </p>
        <p className="mt-2 px-6 text-center text-[10px] leading-4 text-muted/80">
          A student academic resource platform. Not an official FUNAAB portal.
        </p>
      </div>
    </main>
  );
}
