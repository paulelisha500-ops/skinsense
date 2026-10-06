/**
 * Every photo on the site. All are free-licence Unsplash images (credited in
 * the footer). They are illustrative photography only — never SkinSense users
 * and never presented as anyone's result.
 *
 * The query strings must match `images.remotePatterns` in next.config.ts.
 * width/height are the intrinsic size of the ?w=1200 rendition.
 */
const UNSPLASH = "https://images.unsplash.com/";

export type PhotoKey =
  | "portrait"
  | "facial"
  | "handToFace"
  | "clearSkin"
  | "products"
  | "applying"
  | "cleanser"
  | "smiling";

export type Photo = {
  id: string;
  alt: string;
  width: number;
  height: number;
};

export const PHOTOS: Record<PhotoKey, Photo> = {
  portrait: {
    id: "photo-1531123897727-8f129e1688ce",
    width: 1200,
    height: 1800,
    alt: "Close-up portrait of a woman with short natural hair against a deep red wall",
  },
  facial: {
    id: "photo-1616394584738-fc6e612e71b9",
    width: 1200,
    height: 800,
    alt: "A woman lying back with her eyes closed as a white face mask is brushed on during a facial",
  },
  handToFace: {
    id: "photo-1509967419530-da38b4704bc6",
    width: 1200,
    height: 778,
    alt: "A young woman with shoulder-length brown hair resting her fingertips against her cheek",
  },
  clearSkin: {
    id: "photo-1526510747491-58f928ec870f",
    width: 1200,
    height: 1800,
    alt: "A red-haired woman glancing over her shoulder in warm, soft light",
  },
  products: {
    id: "photo-1598440947619-2c35fc9aa908",
    width: 1200,
    height: 1600,
    alt: "Flat lay of assorted skincare tubes, jars and a fragrance bottle on a striped cloth",
  },
  applying: {
    id: "photo-1570172619644-dfd03ed5d881",
    width: 1200,
    height: 800,
    alt: "A clay face mask being brushed onto a woman’s face during a skincare treatment",
  },
  cleanser: {
    id: "photo-1556228720-195a672e8a03",
    width: 1200,
    height: 1800,
    alt: "A tube of facial cleanser beside a swatch of white foam on a plain background",
  },
  smiling: {
    id: "photo-1580489944761-15a19d654956",
    width: 1200,
    height: 1510,
    alt: "A smiling woman with her dark hair in a loose bun, photographed against a white wall",
  },
};

/** Standard size (hero, gallery, cards). */
export function photoSrc(key: PhotoKey): string {
  return `${UNSPLASH}${PHOTOS[key].id}?w=1200&q=80`;
}

/** Large size for the lightbox / zoom view. */
export function photoSrcLarge(key: PhotoKey): string {
  return `${UNSPLASH}${PHOTOS[key].id}?w=2000&q=80`;
}

/** width / height */
export function photoRatio(key: PhotoKey): number {
  return PHOTOS[key].width / PHOTOS[key].height;
}
