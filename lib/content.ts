/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SkinSense — all site copy and data lives here, so text can be edited in one
 *  place. Components only decide how it looks.
 *
 *  Formatting: wrap part of a title in *asterisks* to render it with the
 *  coffee→caramel gradient accent (see components/ui/Accent.tsx).
 *
 *  Honesty rules this file follows (please keep them when editing):
 *  - No testimonials, reviews, ratings, user counts, press logos, awards or
 *    accuracy percentages. No invented people.
 *  - Numbers used: 7 conditions, 34 products mapped, 30-day plan, 100% free,
 *    2 routines (AM/PM), results in seconds.
 *  - Any UI preview is labelled as illustrative, never as a real result.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { PhotoKey } from "./images";

/* ── Shared ───────────────────────────────────────────────────────────────── */

export const DISCLAIMER =
  "SkinSense is an educational screening tool and is not a medical device. It does not diagnose, treat or cure any condition. Always consult a qualified dermatologist or physician about a skin concern, and seek care promptly if your skin is painful, bleeding, spreading or changing rapidly.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Conditions", href: "/#conditions" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
] as const;

export const CTA = {
  openApp: "Open the app",
  analyse: "Analyse my skin",
  getStarted: "Get started free",
  signIn: "Sign in",
} as const;

/* ── Home: hero ───────────────────────────────────────────────────────────── */

export const HERO = {
  badge: "Free AI skin screening",
  badgeDetail: "7 conditions · AM + PM routines",
  titleLead: "Understand your skin.",
  titleAccent: "Then actually improve it.",
  sub: "Take one photo. SkinSense screens it across seven common skin conditions, shows you exactly how confident it is, and turns the result into a morning and evening routine built around the ingredients that matter.",
  primaryCta: "Analyse my skin",
  secondaryCta: "See how it works",
  assurances: ["Free to use", "Passwordless sign-in", "Results in seconds"],
  slides: [
    {
      photo: "portrait",
      position: "50% 30%",
      eyebrow: "One photo",
      title: "Even light, face centred, in focus. That’s the whole setup.",
    },
    {
      photo: "clearSkin",
      position: "50% 45%",
      eyebrow: "7 categories",
      title: "Every score, every time. Not just a headline.",
    },
    {
      photo: "applying",
      position: "52% 50%",
      eyebrow: "Ingredient-led",
      title: "Routines that name the actives doing the work.",
    },
    {
      photo: "smiling",
      position: "50% 40%",
      eyebrow: "30-day plan",
      title: "Check in, keep your streak, compare against your own first scan.",
    },
  ] satisfies Array<{ photo: PhotoKey; position: string; eyebrow: string; title: string }>,
  photoNote: "Illustrative photography",
  floatingTimer: { label: "From photo to reading", value: "Results in seconds" },
  floatingRoutine: { label: "Tonight’s routine", steps: ["Cleanser", "Treatment", "Serum", "Moisturizer"] },
};

/* ── Home: stats ──────────────────────────────────────────────────────────── */

export type Stat =
  | { kind: "number"; value: number; prefix?: string; suffix?: string; label: string }
  | { kind: "text"; display: string; label: string };

export const STATS: Stat[] = [
  { kind: "number", value: 7, label: "Skin conditions screened" },
  { kind: "number", value: 34, label: "Pharmacy products mapped" },
  { kind: "number", value: 30, suffix: "-day", label: "Guided plan with check-ins" },
  { kind: "number", value: 2, label: "Routines, morning + evening" },
  { kind: "number", value: 100, suffix: "%", label: "Free to use" },
  { kind: "text", display: "Seconds", label: "From photo to reading" },
];

/* ── Home: how it works ───────────────────────────────────────────────────── */

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  title: "Photo in. *Plan out.*",
  lede: "No forms to fill in before you see a result. Three steps take you from a single photo to a routine you can start tonight.",
  steps: [
    {
      n: "01",
      icon: "camera",
      title: "Take a photo",
      body: "Upload a photo or take one with your camera. Even light, a clean face and a centred, in-focus shot give the most reliable reading.",
      points: ["Face the camera, no filters", "Soft, even light", "Sharp and centred"],
    },
    {
      n: "02",
      icon: "scan",
      title: "Get your reading",
      body: "A fine-tuned image model scores your photo across all seven categories. You see the top result, a confidence percentage, a severity band and the full breakdown.",
      points: ["Top category + confidence %", "Mild, moderate or severe band", "Scores for all seven"],
    },
    {
      n: "03",
      icon: "routine",
      title: "Follow your routine",
      body: "Your result becomes a morning and evening routine, step by step and led by active ingredients, plus daily habit tips and a 30-day plan to keep you on track.",
      points: ["Cleanser to SPF, in order", "Actives named, not just brands", "Check-ins and a streak"],
    },
  ],
} as const;

/* ── Conditions ───────────────────────────────────────────────────────────── */

export type Condition = {
  slug: string;
  name: string;
  short: string;
  accent: string;
  looks: string;
  triggers: string[];
  ingredients: string[];
  habit: string;
  derm: string;
};

export const CONDITIONS_INTRO = {
  eyebrow: "Coverage",
  title: "Seven categories. *Every score, every time.*",
  lede: "Each category has its own routine template and its own care rules. Whatever your result, you also see how the other six scored. Tap a card for what it looks like, common triggers and when to see a dermatologist.",
  note: "General education only. It describes common patterns, not your skin.",
  otherTitle: "Not on the list?",
  otherBody:
    "Anything outside these seven is still sorted into the closest category. Read the full breakdown, and see a doctor about anything new, changing or worrying.",
};

export const CONDITIONS: Condition[] = [
  {
    slug: "acne",
    name: "Acne",
    short: "Clogged pores, papules and pustules",
    accent: "#A8432F",
    looks:
      "Blackheads and whiteheads, red raised bumps (papules) and pus-filled spots (pustules), most often on the forehead, nose, chin, jawline, chest or back. Spots can leave dark marks behind as they heal.",
    triggers: [
      "Excess oil and dead skin clogging pores",
      "Hormonal shifts, for example around periods",
      "Heavy, oil-based skincare or makeup",
      "Friction and touching: phone screens, helmet straps, resting your face on your hands",
      "For some people, frequent sugary or fried food is associated with flares",
    ],
    ingredients: ["Salicylic acid 2%", "Adapalene 0.1%", "Niacinamide", "Azelaic acid 10%", "Zinc"],
    habit: "Change your pillowcase at least twice a week and clean your phone screen regularly. Try not to pick or squeeze spots.",
    derm: "See a dermatologist if you have painful, deep lumps or cysts, if acne is leaving scars or lasting dark marks, if it hasn’t improved after two to three months of consistent care, or if it’s affecting how you feel day to day. Prescription treatments can help.",
  },
  {
    slug: "dry-skin",
    name: "Dry skin",
    short: "Tightness, flaking, rough texture",
    accent: "#C8A27C",
    looks:
      "Skin that feels tight after washing, with flaking, rough or dull-looking patches. Fine lines can look more obvious, and makeup may cling to dry areas.",
    triggers: [
      "Long, hot showers and hot water on the face",
      "Harsh, stripping or heavily foaming cleansers",
      "Cold weather, wind and low indoor humidity",
      "Over-exfoliating or layering too many strong actives",
    ],
    ingredients: ["Ceramides", "Hyaluronic acid", "Glycerin", "Squalane", "Urea", "Petrolatum"],
    habit: "Apply moisturiser within three minutes of washing, while skin is still slightly damp, and wash with lukewarm rather than hot water.",
    derm: "See a doctor or dermatologist if your skin cracks or bleeds, if itching disturbs your sleep, if patches look red, inflamed or infected, or if dryness doesn’t improve with regular moisturising. It may be eczema or another condition that needs treatment.",
  },
  {
    slug: "eczema",
    name: "Eczema",
    short: "Itchy, inflamed, recurring patches",
    accent: "#C08A1E",
    looks:
      "Itchy, dry, inflamed patches that tend to come and go. They can look red, pink, darker brown, purple or grey depending on skin tone, and may thicken with repeated scratching.",
    triggers: [
      "Fragranced skincare, soaps and laundry products",
      "Heat and sweat, or very dry air",
      "Rough or scratchy fabrics such as wool",
      "Stress and disrupted sleep",
      "Specific allergens or irritants, which differ from person to person",
    ],
    ingredients: ["Colloidal oatmeal", "Ceramides", "Glycerin", "Petrolatum", "Fragrance-free bases"],
    habit: "Moisturise straight after bathing, wear loose, breathable cotton, and switch to fragrance-free detergents.",
    derm: "Eczema often needs prescription treatment, so it’s worth seeing a doctor or dermatologist, especially if patches weep, crust or ooze (possible infection), if the itch is widespread or keeps you awake, or if moisturising isn’t helping. SkinSense recommends a dermatologist for moderate and severe eczema readings.",
  },
  {
    slug: "hyperpigmentation",
    name: "Hyperpigmentation",
    short: "Dark marks and uneven tone",
    accent: "#8A5A36",
    looks:
      "Flat patches or spots that are darker than the surrounding skin: marks left after spots or irritation, sun spots, or larger patches that make tone look uneven.",
    triggers: [
      "Sun exposure, which darkens existing marks",
      "Inflammation from acne, picking, cuts or irritation",
      "Hormonal changes",
      "Harsh products that irritate the skin",
    ],
    ingredients: ["Azelaic acid 10%", "Alpha arbutin", "Tranexamic acid", "Niacinamide", "Vitamin C", "Zinc oxide SPF"],
    habit: "Wear sunscreen every day, even when it’s cloudy. UV darkens existing spots and can undo weeks of progress.",
    derm: "Get any spot checked promptly if it’s new, growing, changing in shape or colour, has an irregular border, or itches or bleeds. Not every dark mark is harmless pigmentation. SkinSense recommends a dermatologist for moderate and severe readings.",
  },
  {
    slug: "normal-skin",
    name: "Normal skin",
    short: "Balanced, no active concern",
    accent: "#5E7A3E",
    looks:
      "Skin that feels comfortable after cleansing: not noticeably oily or tight, with even texture and few blemishes.",
    triggers: [
      "Seasonal changes in temperature and humidity",
      "Introducing several new products at once",
      "Stress, poor sleep and illness",
      "Unprotected sun exposure",
    ],
    ingredients: ["Gentle cleanser", "Hyaluronic acid", "Niacinamide", "Ceramides", "Broad-spectrum SPF"],
    habit: "Keep it simple and consistent. Introduce new products one at a time, and wear SPF every day.",
    derm: "Even when your skin feels fine, see a dermatologist about any mole or spot that’s new, changing, itching or bleeding.",
  },
  {
    slug: "oily-skin",
    name: "Oily skin",
    short: "Excess sebum and midday shine",
    accent: "#B07A4A",
    looks:
      "Shine that builds through the day, especially across the forehead, nose and chin, with enlarged-looking pores and a tendency towards congestion.",
    triggers: [
      "Genetics and hormones",
      "Heat and humidity",
      "Over-cleansing or skipping moisturiser, which can leave skin feeling oilier",
      "Heavy, pore-clogging products",
    ],
    ingredients: ["Niacinamide", "Zinc", "Salicylic acid 2%", "Lightweight hyaluronic acid gels", "Non-comedogenic SPF"],
    habit: "Don’t skip moisturiser. Dehydrated skin can produce more oil. Blotting papers handle midday shine without stripping.",
    derm: "See a doctor or dermatologist if oiliness comes with painful breakouts, if it changes suddenly, or if it appears alongside other new symptoms.",
  },
  {
    slug: "rosacea",
    name: "Rosacea",
    short: "Persistent redness and flushing",
    accent: "#B5564B",
    looks:
      "Persistent redness across the cheeks, nose, chin or forehead, easy flushing, small visible blood vessels and sometimes bumps. Skin often stings or burns. Redness can be harder to see on deeper skin tones.",
    triggers: [
      "Sun, heat and extreme temperatures",
      "Hot drinks, spicy food and alcohol",
      "Stress and intense exercise",
      "Fragranced or harsh skincare",
    ],
    ingredients: ["Azelaic acid 10%", "Niacinamide", "Fragrance-free moisturiser", "Zinc oxide SPF"],
    habit: "Keep a simple trigger diary. Stick to fragrance-free, gentle products and wear SPF daily, since UV can make rosacea worse.",
    derm: "Rosacea is best confirmed and managed with a dermatologist, especially if your eyes feel gritty or irritated, if skin on the nose thickens, or if bumps persist. SkinSense recommends a dermatologist for moderate and severe rosacea readings.",
  },
];

/* ── Home: example reading (UI preview) ───────────────────────────────────── */

export const EXAMPLE_READING = {
  eyebrow: "What you get",
  title: "A reading you can *actually interrogate.*",
  lede: "No black box. Every analysis shows the top category, how confident the model is, a severity band and how all seven categories scored, so you can judge the result for yourself.",
  label: "Example reading",
  note: "Illustrative UI preview, not a real result.",
  top: "Acne",
  confidence: 68,
  severity: "Mild",
  breakdown: [
    { name: "Acne", value: 68 },
    { name: "Oily skin", value: 14 },
    { name: "Normal skin", value: 7 },
    { name: "Hyperpigmentation", value: 5 },
    { name: "Dry skin", value: 3 },
    { name: "Rosacea", value: 2 },
    { name: "Eczema", value: 1 },
  ],
  doctor: "No urgent action needed",
  severityNote:
    "Your condition appears mild. Consistent use of the recommended routine should show visible improvement within 4–8 weeks.",
  points: [
    {
      icon: "gauge",
      title: "Confidence you can see",
      body: "A single percentage for the top result, plus a bar for every category. Scores spread across several categories tell you the photo was ambiguous.",
    },
    {
      icon: "layers",
      title: "A severity band, honestly framed",
      body: "Mild, moderate or severe reflects how strongly the photo matches the top category. It’s a guide, not a clinical grade.",
    },
    {
      icon: "stethoscope",
      title: "Escalation built in",
      body: "Severe readings, and moderate ones for rosacea, eczema or hyperpigmentation, come with a clear recommendation to see a dermatologist.",
    },
    {
      icon: "help",
      title: "Honest about uncertainty",
      body: "When no category clearly stands out, the result is marked low-confidence and you’re asked to retake the photo.",
    },
  ],
};

/* ── Home: routine ────────────────────────────────────────────────────────── */

export type RoutineStep = {
  step: string;
  actives: string[];
  tip: string;
};

export const ROUTINE = {
  eyebrow: "Routines",
  title: "Two routines. *Led by ingredients, not hype.*",
  lede: "Your result maps to a morning and evening routine drawn from 34 widely available drugstore and pharmacy products, organised by step and led by the active ingredients that do the work.",
  exampleLabel: "Example routine for a mild acne reading",
  exampleNote: "Ingredient view. The app also names an example product for each step, and any product with the same key ingredients does the same job.",
  morning: [
    {
      step: "Cleanser",
      actives: ["Niacinamide", "Ceramides", "Hyaluronic acid"],
      tip: "Massage gently for 60 seconds, then rinse with lukewarm water.",
    },
    {
      step: "Exfoliant",
      actives: ["Salicylic acid 2%"],
      tip: "Apply to dry skin and wait 20 minutes before the next step. Three times a week at most.",
    },
    {
      step: "Serum",
      actives: ["Niacinamide 10%", "Zinc 1%"],
      tip: "Apply 2–3 drops to damp skin and press in rather than rubbing.",
    },
    {
      step: "Moisturizer",
      actives: ["Hyaluronic acid", "Glycerin"],
      tip: "Apply while skin is still slightly damp to lock in hydration.",
    },
    {
      step: "Sunscreen",
      actives: ["Zinc oxide SPF"],
      tip: "Apply last, every morning. Reapply every 2 hours in direct sun.",
    },
  ] satisfies RoutineStep[],
  evening: [
    {
      step: "Cleanser",
      actives: ["Niacinamide", "Ceramides", "Hyaluronic acid"],
      tip: "Massage gently for 60 seconds, then rinse with lukewarm water.",
    },
    {
      step: "Treatment",
      actives: ["Adapalene 0.1%"],
      tip: "A pea-sized amount only. Use at night, as it can make skin more sensitive to the sun.",
    },
    {
      step: "Serum",
      actives: ["Niacinamide 10%", "Zinc 1%"],
      tip: "Apply 2–3 drops to damp skin and press in rather than rubbing.",
    },
    {
      step: "Moisturizer",
      actives: ["Hyaluronic acid", "Glycerin"],
      tip: "Apply while skin is still slightly damp to lock in hydration.",
    },
  ] satisfies RoutineStep[],
  habitsTitle: "Daily habits that come with it",
  habits: [
    "Change your pillowcase at least twice a week",
    "Never sleep with makeup on",
    "Keep hair away from your face",
    "Clean your phone screen regularly",
  ],
  marqueeTitle: "Actives you’ll see in your routine",
};

export const INGREDIENTS_ROW_1 = [
  "Niacinamide",
  "Salicylic acid 2%",
  "Azelaic acid 10%",
  "Adapalene 0.1%",
  "Ceramides",
  "Hyaluronic acid",
  "Alpha arbutin 2%",
  "Tranexamic acid 2%",
  "Zinc oxide SPF",
  "Glycolic acid 7%",
];

export const INGREDIENTS_ROW_2 = [
  "Mandelic acid 12%",
  "Colloidal oatmeal",
  "Squalane",
  "Vitamin C",
  "Panthenol",
  "Urea",
  "Zinc PCA",
  "Glycerin",
  "PHA (gluconolactone)",
  "Petrolatum",
];

/* ── Home: progress / before-after ────────────────────────────────────────── */

export const PROGRESS = {
  eyebrow: "Progress tracking",
  title: "Your own *before and after.*",
  lede: "Skin changes too slowly to judge from memory. SkinSense keeps your first scan as a baseline and puts it side by side with your latest one, so you compare photographs instead of impressions.",
  features: [
    {
      icon: "calendar",
      title: "30-day guided plan",
      body: "Your plan starts with your first analysis. Every scan after that is logged as a check-in against it.",
    },
    {
      icon: "flame",
      title: "A streak that means something",
      body: "Only real activity counts: a scan or a completed routine. Simply signing in doesn’t.",
    },
    {
      icon: "chart",
      title: "Check-in history",
      body: "See how the confidence for the condition you’re tracking moves across your recent check-ins.",
    },
    {
      icon: "stethoscope",
      title: "Flags when to see a doctor",
      body: "If recent check-ins keep coming back severe, or keep getting worse, your plan recommends seeing a dermatologist soon.",
    },
  ],
  panelsTitle: "Before / after",
  panelsTag: "Your photos only",
  panels: [
    { label: "Your first scan", tag: "Baseline", note: "Kept as the reference the moment you first analyse." },
    { label: "Your latest scan", tag: "Latest", note: "Replaced each time you come back and scan again." },
  ],
  panelsNote:
    "These panels fill with your own photos once you sign in and scan. SkinSense never shows you someone else’s skin as if it were your result.",
  chartLabel: "Check-in history",
  chartTitle: "Confidence for your tracked condition",
  chartNote: "Illustration of the chart, not real data.",
  chartPoints: [72, 70, 69, 64, 61, 57, 55],
};

/* ── Home: privacy & safety ───────────────────────────────────────────────── */

export const PRIVACY_SAFETY = {
  eyebrow: "Privacy & safety",
  title: "Careful with your data. *Clear about its limits.*",
  lede: "A skin photo is personal. SkinSense stores as little as it can, keeps it private, and is upfront that it’s a screening tool, not a doctor.",
  codeLabel: "Enter the 6-digit code sent to",
  codeEmail: "you@example.com",
  items: [
    {
      icon: "mail",
      title: "Passwordless sign-in",
      body: "Sign in with your email and a 6-digit code. No password to create, reuse or leak.",
    },
    {
      icon: "database",
      title: "Only what’s needed",
      body: "Your email, the optional profile answers you choose to give, and your check-in history, kept in a private dataset.",
    },
    {
      icon: "image",
      title: "Your photos aren’t for sale",
      body: "Photos are analysed to render your result and before/after comparison. They are not sold or shared.",
    },
    {
      icon: "stethoscope",
      title: "Escalates when it should",
      body: "Results that look severe, or moderate for rosacea, eczema or hyperpigmentation, recommend seeing a dermatologist.",
    },
  ],
  linkTitle: "The plain-language version",
  linkBody: "Exactly what’s stored, what isn’t, and how to ask for deletion.",
  linkCta: "Read the privacy summary",
};

/* ── Home: FAQ teaser ─────────────────────────────────────────────────────── */

export const FAQ_TEASER = {
  eyebrow: "FAQ",
  title: "Questions people *ask first.*",
  lede: "If something isn’t covered here, the disclaimer at the bottom of every page is the short version: SkinSense helps you understand your skin, it does not diagnose it.",
  cta: "See all questions",
};

/* ── Home: gallery ────────────────────────────────────────────────────────── */

export const GALLERY = {
  eyebrow: "Gallery",
  title: "Skin, *up close.*",
  lede: "The everyday rituals SkinSense is built around. Tap any photo to open it.",
  note: "Illustrative stock photography from Unsplash. These are not SkinSense users or results.",
  items: [
    { photo: "portrait", caption: "Close up, evenly lit and facing the camera: the kind of photo that reads best." },
    { photo: "products", caption: "A shelf of products bought on a guess. SkinSense starts from ingredients instead." },
    { photo: "applying", caption: "Masks and treatments work best as part of a steady routine." },
    { photo: "clearSkin", caption: "Balanced skin still benefits from daily SPF." },
    { photo: "cleanser", caption: "Cleansing comes first, morning and evening." },
    { photo: "handToFace", caption: "Know what you’re looking at before you treat it." },
    { photo: "facial", caption: "Gentle, consistent care beats harsh, occasional fixes." },
    { photo: "smiling", caption: "Change takes weeks. A tracker helps you stay with it." },
  ] satisfies Array<{ photo: PhotoKey; caption: string }>,
};

/* ── Home: final CTA ──────────────────────────────────────────────────────── */

export const FINAL_CTA = {
  title: "One photo. A clear reading. *A routine you can keep.*",
  body: "Free to use. Sign in with your email, verify a 6-digit code, and analyse your first photo.",
  primary: "Analyse my skin",
  secondary: "Read the FAQ",
  footnote: "Educational screening, not a diagnosis.",
};

/* ── FAQ ──────────────────────────────────────────────────────────────────── */

export type FaqCategoryId = "basics" | "results" | "routines" | "progress" | "privacy";

export const FAQ_CATEGORIES: Array<{ id: FaqCategoryId | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "basics", label: "The basics" },
  { id: "results", label: "Results & accuracy" },
  { id: "routines", label: "Routines & products" },
  { id: "progress", label: "Progress" },
  { id: "privacy", label: "Privacy & data" },
];

export type Faq = {
  id: string;
  q: string;
  a: string;
  category: FaqCategoryId;
  /** Shown in the home page teaser (top five). */
  featured?: boolean;
};

export const FAQ_PAGE = {
  eyebrow: "FAQ",
  title: "Questions, *answered.*",
  lede: "Everything people ask about SkinSense, from what it can recognise to what happens to your data. Search, or browse by topic.",
  searchLabel: "Search questions",
  searchPlaceholder: "Search, e.g. “photos”, “diet” or “sunscreen”",
  emptyTitle: "No questions match",
  emptyBody: "Try a different word, or clear the search to browse every topic.",
  asideEyebrow: "Still unsure?",
  asideTitle: "The quickest way to understand SkinSense is to try it.",
  asideBody: "It’s free: sign in with your email and a 6-digit code.",
};

export const FAQS: Faq[] = [
  {
    id: "diagnosis",
    category: "basics",
    featured: true,
    q: "Is SkinSense a medical diagnosis?",
    a: "No. SkinSense is an educational screening tool. It gives you a likely category and a care routine to try, but it is not a diagnosis and it does not replace a consultation with a qualified dermatologist. If your result is flagged as severe, or your skin is painful, bleeding, spreading or changing quickly, please see a doctor.",
  },
  {
    id: "conditions",
    category: "basics",
    featured: true,
    q: "Which conditions can it recognise?",
    a: "Seven categories: acne, dry skin, eczema, hyperpigmentation, normal skin, oily skin and rosacea. Anything outside those seven will still be sorted into the closest category, so read the full confidence breakdown rather than only the headline result.",
  },
  {
    id: "accuracy",
    category: "results",
    featured: true,
    q: "How accurate is the analysis?",
    a: "Accuracy depends heavily on your photo. Good, even lighting, a clean face and a centred, in-focus shot give the most reliable result. Every analysis shows a confidence score and a full breakdown across all seven categories so you can judge how certain the model actually is.",
  },
  {
    id: "photos",
    category: "privacy",
    featured: true,
    q: "What happens to my photos?",
    a: "Your photo is analysed and used to render your result and your before/after comparison. It is not sold or shared. Only your email, the profile answers you choose to give, and your check-in history are stored, in a private dataset used to keep your streak and progress.",
  },
  {
    id: "diet",
    category: "routines",
    featured: true,
    q: "Why do you ask about my diet?",
    a: "Diet is not the cause of every skin condition, but frequent fried and sugary food is associated with worse outcomes for acne, oily skin and hyperpigmentation. The questions are optional and you can skip every one of them.",
  },
  {
    id: "free",
    category: "basics",
    q: "Is SkinSense free?",
    a: "Yes. Sign in with your email, verify the code, and everything is available: analysis, routines, streaks and progress tracking.",
  },
  {
    id: "phones",
    category: "basics",
    q: "Does it work on phones?",
    a: "Yes. SkinSense runs in your web browser, so it works on phones, tablets and computers with nothing to install. You can upload a photo you already have or take a new one with your camera.",
  },
  {
    id: "sign-in",
    category: "basics",
    q: "How do I sign in?",
    a: "With your email address. SkinSense sends you a 6-digit code; enter it and you’re in. There’s no password to create or remember.",
  },
  {
    id: "good-photo",
    category: "results",
    q: "What makes a good photo?",
    a: "Face the camera in soft, even light. Near a window works well; harsh direct sun or a single overhead bulb doesn’t. Remove makeup and filters, keep your face centred and filling most of the frame, and make sure the shot is sharp. Use similar conditions for every check-in so comparisons are fair.",
  },
  {
    id: "confidence",
    category: "results",
    q: "Why does the confidence score matter?",
    a: "A result is only as useful as how certain it is. The confidence score tells you how strongly your photo matched the top category, and the breakdown shows how the other six scored. One clear leader means a clearer signal; scores spread across several categories mean the photo is ambiguous. When no category stands out, SkinSense marks the reading as low-confidence and asks you to retake the photo rather than pretending to be sure.",
  },
  {
    id: "skin-tones",
    category: "results",
    q: "Does it work on every skin tone and in any lighting?",
    a: "Lighting, camera quality and skin tone all change how skin looks in a photo, and image models can perform differently across skin tones. Redness and dark marks, for example, can look quite different on deeper skin. Treat every result as a starting point: check the full breakdown, keep your photo conditions consistent, and see a dermatologist whenever you’re unsure.",
  },
  {
    id: "severity",
    category: "results",
    q: "What do mild, moderate and severe mean?",
    a: "The severity band reflects how strongly your photo matches the top category: the clearer the signal, the higher the band. It’s a guide to how pronounced the pattern looks in your photo, not a clinical grading of your condition.",
  },
  {
    id: "see-a-doctor",
    category: "results",
    q: "What happens if my result says to see a dermatologist?",
    a: "SkinSense recommends a dermatologist when a result looks severe, or moderate for rosacea, eczema or hyperpigmentation. Your routine is still shown so you have something gentle to follow while you arrange an appointment, but prescription treatment may be needed. If your skin is painful, bleeding, spreading or changing quickly, don’t wait: seek care promptly.",
  },
  {
    id: "not-listed",
    category: "results",
    q: "What if my skin concern isn’t one of the seven?",
    a: "SkinSense only knows seven categories, so anything else, such as a mole, an infection, psoriasis or a rash, will still be sorted into whichever category it most resembles. That’s why the full breakdown matters, and why anything new, changing or worrying should be looked at by a doctor.",
  },
  {
    id: "buy-products",
    category: "routines",
    q: "Do I need to buy the products you recommend?",
    a: "No. The routine is a template built from widely available drugstore and pharmacy products, shown so you can see the active ingredients that matter. Any product with the same key ingredients will do the same job.",
  },
  {
    id: "how-routines",
    category: "routines",
    q: "How are routines chosen?",
    a: "Each of the seven categories is mapped to products from a set of 34 widely available drugstore and pharmacy products, grouped by step: cleanser, exfoliant, serum, moisturizer, sunscreen and treatment. The morning routine runs cleanser, exfoliant, serum, moisturizer and sunscreen. The evening routine adds a treatment step, such as a retinoid or azelaic acid, and leaves out exfoliation. Every step names its key active ingredients and comes with a short how-to tip, and daily habit tips sit alongside.",
  },
  {
    id: "own-products",
    category: "routines",
    q: "Can I keep using products I already own?",
    a: "Often, yes. Compare the key ingredients in what you already have with the ones your routine names. If they match, your product can do the same job. Introduce anything new one product at a time so you can tell what’s helping and what’s irritating.",
  },
  {
    id: "how-long",
    category: "progress",
    q: "How long before I see a change?",
    a: "Skin turns over slowly. Most routines need four to eight weeks of consistent use before a visible difference, and pigmentation can take twelve weeks or more. The progress tracker is there to help you stay with it long enough to judge fairly.",
  },
  {
    id: "plan",
    category: "progress",
    q: "What is the 30-day plan?",
    a: "Your plan starts the first time you analyse your skin. Each scan after that is saved as a check-in, so you can see how the confidence for your tracked condition moves over time. Your streak counts the days you actually did something: a scan or a completed routine.",
  },
  {
    id: "before-after",
    category: "progress",
    q: "How does the before/after comparison work?",
    a: "Your first scan is kept as a baseline. Each time you scan again, your latest photo appears next to it, so you compare photographs rather than memories. It only ever shows your own photos.",
  },
  {
    id: "stored",
    category: "privacy",
    q: "What exactly do you store?",
    a: "Your email address, the optional profile answers you choose to give (name, age, weight, height and diet habits), and your check-in history, meaning the date and reading of each check-in, used to keep your streak and progress. It’s kept in a private dataset.",
  },
  {
    id: "delete",
    category: "privacy",
    q: "How do I delete my data?",
    a: "Email us from the address you signed in with and ask for your data to be deleted. Writing from that address lets us confirm the request is really yours. We’ll then delete your email, profile answers and check-in history.",
  },
];

/* ── About ────────────────────────────────────────────────────────────────── */

export const ABOUT = {
  hero: {
    eyebrow: "About SkinSense",
    title: "Built to make skin advice *legible.*",
    lede: "SkinSense turns one photo into something you can actually read: a screening result, a confidence figure you can weigh, and a routine short enough to keep.",
    primaryCta: "Analyse my skin",
    secondaryCta: "How the model works",
  },
  problem: {
    eyebrow: "The problem",
    title: "A search, a wall of contradictory advice, a shelf of products bought on a guess.",
    body: [
      "That’s how most people meet a skin problem. One source swears by an ingredient another warns against. A product is recommended without a word about what’s in it. It’s hard to know what you’re looking at, harder to know what to try, and hardest of all to tell whether it’s working.",
      "Meanwhile, getting a dermatologist’s opinion can take time, and many everyday concerns never get one. People are left guessing, and guessing is expensive.",
    ],
    photoNote: "Illustrative photo, not a SkinSense recommendation.",
  },
  mission: {
    eyebrow: "Our mission",
    title: "Replace the first hour of guessing with *something concrete.*",
    body: "A transparent screening result. An ingredient-led routine from products you can find at a pharmacy. A simple way to track your own progress. And a clear hand-off to a dermatologist the moment your results suggest you need one.",
  },
  principles: {
    eyebrow: "Principles",
    title: "Four rules *we build by.*",
    items: [
      {
        icon: "eye",
        title: "Transparent by default",
        body: "Every score, every time. You always see the full breakdown across all seven categories, not just a headline, because a number you can’t interrogate isn’t much better than a guess.",
      },
      {
        icon: "flask",
        title: "Ingredient-led",
        body: "Routines name the actives, not just brands: niacinamide, salicylic acid, azelaic acid, ceramides. Any product with the same key ingredients does the same job.",
      },
      {
        icon: "stethoscope",
        title: "Escalates when it should",
        body: "Severe results are flagged for a doctor, as are moderate results for rosacea, eczema and hyperpigmentation, and repeated severe check-ins.",
      },
      {
        icon: "lock",
        title: "Privacy first",
        body: "Passwordless sign-in, optional profile questions, and only what’s needed stored in a private dataset. Photos are not sold or shared.",
      },
    ],
  },
  model: {
    eyebrow: "Under the hood",
    title: "How the *model works.*",
    lede: "SkinSense uses a fine-tuned EfficientNet-B0, a compact convolutional neural network designed to be accurate for its size. It starts from a version pre-trained on general images and is fine-tuned on labelled skin photos across the seven categories.",
    pipeline: [
      { title: "Your photo", body: "One face photo, uploaded or taken with your camera." },
      { title: "Prepared", body: "Resized to 224 × 224 pixels and colour-normalised, the format the model learned from." },
      { title: "Classified", body: "EfficientNet-B0 outputs a probability for each of the seven categories." },
      { title: "Explained", body: "The top category is your result, its probability is your confidence, and a severity band is derived from it." },
      { title: "Actioned", body: "The result maps to AM and PM routines, habit tips and, when warranted, a recommendation to see a dermatologist." },
    ],
    spec: [
      { k: "Architecture", v: "EfficientNet-B0, fine-tuned" },
      { k: "Input", v: "One RGB photo at 224 × 224" },
      { k: "Output", v: "Probabilities for 7 categories" },
      { k: "Result", v: "Top category + its confidence" },
      { k: "Severity band", v: "Derived from that confidence" },
      { k: "Doctor flag", v: "Severe, or moderate for rosacea, eczema, hyperpigmentation" },
    ],
  },
  limits: {
    eyebrow: "Limits",
    title: "What it can’t do, *and why that matters.*",
    lede: "Being clear about the limits is part of being useful. Please read these before relying on a result.",
    items: [
      {
        title: "It only knows seven categories",
        body: "Anything else, such as a mole, an infection, psoriasis or a rash, is still sorted into whichever of the seven it most resembles.",
      },
      {
        title: "It reads a photo, not your skin",
        body: "Lighting, camera quality, makeup, filters and angle all change the result. Poor photos give unreliable readings.",
      },
      {
        title: "Performance can vary across skin tones",
        body: "Redness and pigmentation look different on different skin, and a model is only as broad as the photos it learned from.",
      },
      {
        title: "Severity isn’t a clinical grade",
        body: "The band reflects how strongly the photo matches the top category, not how serious your condition is.",
      },
      {
        title: "It can’t ask questions",
        body: "A dermatologist considers your history, symptoms, how your skin feels and how fast it’s changing. A photo can’t capture any of that.",
      },
      {
        title: "It isn’t a medical device",
        body: "SkinSense does not diagnose, treat or cure any condition. It’s a starting point for understanding, not a substitute for care.",
      },
    ],
  },
  next: {
    eyebrow: "What’s next",
    title: "Where we’d like to *take it.*",
    note: "Intentions, not promises or timelines",
    items: [
      {
        title: "Broader, fairer evaluation",
        body: "We want to better understand how the model behaves across skin tones and lighting conditions, and improve where it falls short.",
      },
      {
        title: "Better photo guidance",
        body: "We’d like the capture step to spot poor lighting or focus before a photo is analysed, so fewer readings end up low-confidence.",
      },
      {
        title: "Self-serve data controls",
        body: "We aim to let you download or delete your own data from inside the app, without needing to email us.",
      },
      {
        title: "Easier hand-offs",
        body: "We’d like to make it simple to bring your check-in history to a dermatologist appointment.",
      },
    ],
  },
};

/* ── Privacy ──────────────────────────────────────────────────────────────── */

// TODO(owner): add the public contact address for data requests here and in
// the privacy page once one exists. Until then the copy says "email us from
// the address you signed in with" without naming an address.
export const PRIVACY = {
  eyebrow: "Privacy",
  title: "Privacy, in *plain language.*",
  lede: "The short version: SkinSense stores as little as it can, keeps it private, and never sells or shares your photos.",
  updated: "11 September 2026",
  glanceTitle: "At a glance",
  stored: {
    title: "What we store",
    items: [
      {
        title: "Your email address",
        body: "Used to send your 6-digit sign-in code and to keep your account together.",
      },
      {
        title: "Optional profile answers",
        body: "Name, age, weight, height and diet habits (oily or fried food, fast food, sweets), only if you choose to answer. They sharpen your advice, for example the diet insight for acne, oily skin and pigmentation.",
      },
      {
        title: "Your check-in history",
        body: "The date of each check-in and the reading it produced (category, confidence and severity band), used to keep your plan, streak and progress.",
      },
    ],
  },
  notStored: {
    title: "What we don’t do",
    items: [
      {
        title: "No passwords",
        body: "Sign-in is passwordless, so there’s no password to store, reuse or leak.",
      },
      {
        title: "Photos are not sold or shared",
        body: "Your photo is analysed to render your result and your before/after comparison. It is not sold or shared.",
      },
      {
        title: "Nothing you didn’t choose to give",
        body: "Every profile question is optional. Skip them all and SkinSense still works.",
      },
    ],
  },
  sections: [
    {
      id: "where",
      title: "Where it’s kept",
      body: "Your email, optional profile answers and check-in history are kept in a private dataset, used only to run SkinSense for you: your sign-in, your plan, your streak and your progress.",
    },
    {
      id: "why",
      title: "Why we need it",
      body: "Your email lets you sign in without a password. Your check-in history powers the 30-day plan, your streak, your confidence trend and the doctor flag. Profile answers are optional and only used to tailor advice.",
    },
    {
      id: "this-site",
      title: "This website",
      body: "This marketing website doesn’t ask you for any personal information. Signing in and analysing your skin both happen in the SkinSense app.",
    },
    {
      id: "changes",
      title: "Changes",
      body: "If what we store changes, we’ll update this page and the date at the top.",
    },
  ],
  deletion: {
    title: "Deleting your data",
    lead: "Email us from the address you signed in with.",
    body: "You can ask for your data to be deleted at any time. Say you’d like your account deleted; writing from the address you signed in with lets us confirm the request is really yours. We’ll then delete your email, profile answers and check-in history.",
  },
  medicalTitle: "Medical disclaimer",
};

/* ── Footer ───────────────────────────────────────────────────────────────── */

/** `href: "app"` is replaced with NEXT_PUBLIC_APP_URL at render time. */
export const FOOTER = {
  tagline:
    "Free AI skin screening across seven common conditions, with ingredient-led routines and a 30-day plan to track your own progress.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "/#how-it-works" },
        { label: "Conditions", href: "/#conditions" },
        { label: "Routines", href: "/#routines" },
        { label: "Progress", href: "/#progress" },
      ],
    },
    {
      title: "Learn",
      links: [
        { label: "About", href: "/about" },
        { label: "FAQ", href: "/faq" },
        { label: "Privacy", href: "/privacy" },
      ],
    },
    {
      title: "App",
      links: [
        { label: "Open the app", href: "app" },
        { label: "Sign in", href: "app" },
        { label: "Analyse my skin", href: "app" },
      ],
    },
  ],
  bottom: "Educational screening, not a diagnosis.",
};

/* ── 404 ──────────────────────────────────────────────────────────────────── */

export const NOT_FOUND = {
  code: "404",
  title: "This page slipped *out of frame.*",
  body: "The link may be broken, or the page may have moved. Here are a few good places to pick things back up.",
};
