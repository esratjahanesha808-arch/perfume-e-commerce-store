export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary?: boolean;
}

export interface ScentNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface ProductAttributes {
  gender?: string;
  season?: string[];
  intensity?: string;
  longevity?: string;
  sillage?: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  volume: string | null;
  avgRating: number;
  reviewCount: number;
  scentNotes: ScentNotes | null;
  attributes: ProductAttributes | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  images: ProductImage[];
  inventory: { quantity: number; reserved: number } | null;
  reviews: ProductReview[];
}

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { name: string | null; avatarUrl: string | null };
}

export interface SizeOption {
  label: string;
  price: number;
}

export type ProductTab = "description" | "notes" | "ingredients" | "shipping";
