import { cn } from "@/lib/utils";

/**
 * The JNV emblem, sized for the site header.
 *
 * The source artwork has a white background rather than transparency, and the
 * headers are navy (`bg-primary`), so it sits on a white disc — otherwise it
 * reads as a stray white rectangle. The disc also gives the detailed emblem a
 * little breathing room at small sizes.
 *
 * `alt` is empty on purpose: every use is next to the site name in text, so a
 * description here would just be announced twice.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // overflow-hidden matters: the artwork carries its own opaque white
        // square, whose corners would otherwise poke past the disc.
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white",
        className,
      )}
    >
      <img src="/favicon.png" alt="" className="h-7 w-7 object-contain" />
    </span>
  );
}
