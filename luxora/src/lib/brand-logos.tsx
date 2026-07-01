import type { ReactNode } from "react";

/** Brand logo marks + static catalog for the Brands page */

export interface BrandEntry {
  name: string;
  slug: string;
  logo: ReactNode;
}

function ChanelLogo() {
  return (
    <svg viewBox="0 0 48 32" width="44" height="30" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="17" cy="16" r="11" />
      <circle cx="31" cy="16" r="11" />
    </svg>
  );
}

function DiorLogo() {
  return (
    <svg viewBox="0 0 36 44" width="28" height="36" fill="currentColor" aria-hidden>
      <text x="50%" y="76%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fontWeight="300">
        D
      </text>
    </svg>
  );
}

function TomFordLogo() {
  return (
    <svg viewBox="0 0 52 36" width="44" height="30" fill="currentColor" aria-hidden>
      <text x="50%" y="74%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, serif" fontSize="28" fontWeight="300" letterSpacing="2">
        TF
      </text>
    </svg>
  );
}

function CreedLogo() {
  return (
    <svg viewBox="0 0 40 30" width="38" height="28" fill="currentColor" aria-hidden>
      <rect x="3" y="22" width="34" height="5" rx="1" />
      <path d="M3 22 L3 14 L11 20 L20 8 L29 20 L37 14 L37 22 Z" />
      <circle cx="3" cy="14" r="2.2" />
      <circle cx="20" cy="8" r="2.2" />
      <circle cx="37" cy="14" r="2.2" />
    </svg>
  );
}

function PenhaligonsLogo() {
  return (
    <svg viewBox="0 0 36 42" width="30" height="36" fill="currentColor" aria-hidden>
      <path d="M18 40 C18 40 3 30 3 16 L3 4 L33 4 L33 16 C33 30 18 40 18 40 Z" />
      <path d="M18 34 C18 34 8 26 8 16 L8 9 L28 9 L28 16 C28 26 18 34 18 34 Z" fill="currentColor" fillOpacity="0.35" />
      <rect x="16.5" y="11" width="3" height="14" fill="currentColor" fillOpacity="0.55" />
      <rect x="10" y="16.5" width="16" height="3" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}

function XerjoffLogo() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="currentColor" aria-hidden>
      <text x="50%" y="74%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fontWeight="200" letterSpacing="2">
        X
      </text>
    </svg>
  );
}

function AmouageLogo() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="currentColor" aria-hidden>
      <path d="M20 6 A14 14 0 1 0 20 34 A10 10 0 1 1 20 6 Z" />
      <polygon points="32,10 33.4,14.3 38,14.3 34.3,16.9 35.7,21.2 32,18.6 28.3,21.2 29.7,16.9 26,14.3 30.6,14.3" />
    </svg>
  );
}

function ByredoLogo() {
  return (
    <svg viewBox="0 0 80 24" width="52" height="16" fill="currentColor" aria-hidden>
      <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="400" letterSpacing="3">
        BYREDO
      </text>
    </svg>
  );
}

function MfkLogo() {
  return (
    <svg viewBox="0 0 48 36" width="40" height="30" fill="currentColor" aria-hidden>
      <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="400" letterSpacing="1">
        MFK
      </text>
    </svg>
  );
}

function TextLogo({ text }: { text: string }) {
  return (
    <span className="brand-card-fallback text-[10px] tracking-[0.12em] font-bold uppercase">
      {text}
    </span>
  );
}

const FEATURED_BRANDS: BrandEntry[] = [
  { name: "CHANEL", slug: "chanel", logo: <ChanelLogo /> },
  { name: "DIOR", slug: "dior", logo: <DiorLogo /> },
  { name: "TOM FORD", slug: "tom-ford", logo: <TomFordLogo /> },
  { name: "CREED", slug: "creed", logo: <CreedLogo /> },
  { name: "PENHALIGON'S", slug: "penhaligons", logo: <PenhaligonsLogo /> },
  { name: "XERJOFF", slug: "xerjoff", logo: <XerjoffLogo /> },
  { name: "AMOUAGE", slug: "amouage", logo: <AmouageLogo /> },
  { name: "BYREDO", slug: "byredo", logo: <ByredoLogo /> },
  { name: "MAISON FRANCIS KURKDJIAN", slug: "maison-francis-kurkdjian", logo: <MfkLogo /> },
];

const ADDITIONAL_BRAND_NAMES = [
  "YSL", "GUCCI", "HERMÈS", "PRADA", "ARMANI", "VERSACE", "BVLGARI", "GIVENCHY", "BURBERRY",
  "VALENTINO", "DOLCE & GABBANA", "CAROLINA HERRERA", "MONTBLANC", "HUGO BOSS", "LANCÔME",
  "ACQUA DI PARMA", "JO MALONE", "MAISON MARGIELA", "LE LABO", "DIPTYQUE", "KILIAN", "INITIO",
  "PARFUMS DE MARLY", "NISHANE", "MONTALE", "MANCERA", "ROJA PARFUMS", "CLIVE CHRISTIAN",
  "BOND NO. 9", "FRÉDÉRIC MALLE", "SERGE LUTENS", "L'ARTISAN PARFUMEUR", "ATELIER COLOGNE",
  "MEMO PARIS", "EX NIHILO", "JULiette HAS A GUN", "ESCENTRIC MOLECULES", "COMME DES GARÇONS",
  "NASOMATTO", "ORMONDE JAYNE", "FLORIS", "ATKINSONS", "ACQUA DI PORTOFINO", "BENTLEY",
  "JAGUAR", "LALIQUE", "TRUSSARDI", "TRUDON", "CARTIER", "CHOPARD", "BALMAIN", "BALENCIAGA",
  "BOTTEGA VENETA", "LOEWE", "FENDI", "MOSCHINO", "ROBERTO CAVALLI", "ZADIG & VOLTAIRE",
  "ISSEY MIYAKE", "KENZO", "LANVIN", "MUGLER", "NINA RICCI", "PACO RABANNE", "ROCHAS",
  "SALVATORE FERRAGAMO", "STELLA MCCARTNEY", "THIERRY MUGLER", "VAN CLEEF", "VIKTOR & ROLF",
  "ZEGNA", "ABERCROMBIE", "AZZARO", "BENETTON", "BRIONI", "CALVIN KLEIN", "DAVIDOFF",
  "DUNHILL", "ESTÉE LAUDER", "GIVENCHY", "HOLLISTER", "JIMMY CHOO", "LACOSTE", "MARC JACOBS",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const STATIC_BRANDS: BrandEntry[] = [
  ...FEATURED_BRANDS,
  ...ADDITIONAL_BRAND_NAMES.map((name) => ({
    name,
    slug: slugify(name),
    logo: <TextLogo text={name.slice(0, 3)} />,
  })),
];

export function getBrandLogo(name: string): ReactNode | null {
  const match = STATIC_BRANDS.find((b) => b.name.toUpperCase() === name.toUpperCase());
  return match?.logo ?? null;
}
