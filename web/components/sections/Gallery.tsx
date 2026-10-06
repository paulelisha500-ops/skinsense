"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import { Accent } from "@/components/ui/Accent";
import { Container } from "@/components/ui/Container";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GALLERY } from "@/lib/content";
import { PHOTOS, photoRatio, photoSrc, photoSrcLarge } from "@/lib/images";

const ITEMS: LightboxItem[] = GALLERY.items.map((item) => ({
  src: photoSrcLarge(item.photo),
  thumb: photoSrc(item.photo),
  alt: PHOTOS[item.photo].alt,
  caption: item.caption,
  ratio: photoRatio(item.photo),
}));

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="py-24 sm:py-28 lg:py-32">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="gallery-title"
            eyebrow={GALLERY.eyebrow}
            title={<Accent text={GALLERY.title} />}
            lede={GALLERY.lede}
          />
          <p className="max-w-xs text-sm leading-relaxed text-subtle lg:text-right">{GALLERY.note}</p>
        </div>

        <ul className="mt-12 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          {GALLERY.items.map((item, i) => (
            <li key={item.photo} className="mb-3 break-inside-avoid sm:mb-4">
              <Reveal delay={(i % 4) * 0.06}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-haspopup="dialog"
                  aria-label={`Open photo ${i + 1} of ${ITEMS.length}: ${item.caption}`}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-latte ring-1 ring-hairline"
                >
                  <span className="relative block w-full" style={{ aspectRatio: photoRatio(item.photo) }}>
                    <Image
                      src={photoSrc(item.photo)}
                      alt={PHOTOS[item.photo].alt}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-espresso/85 via-espresso/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 grid size-9 scale-90 place-items-center rounded-full bg-warm-white/90 text-ink opacity-0 shadow-soft backdrop-blur transition duration-500 ease-out-expo group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                  >
                    <Maximize2 className="size-4" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-[13px] leading-snug text-cream opacity-0 transition duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    {item.caption}
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>

      <Lightbox items={ITEMS} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </section>
  );
}
