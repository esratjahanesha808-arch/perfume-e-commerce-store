import Link from "next/link";

import { ProductCard } from "@/components/shared/ProductCard";



type RecommendedProduct = {

  id: string;

  name: string;

  slug: string;

  shortDesc: string | null;

  price: number;

  comparePrice: number | null;

  volume: number | null;

  avgRating: number;

  reviewCount: number;

  brand: { name: string } | null;

  images: { url: string; altText: string | null }[];

  badge?: "BEST SELLER" | "NEW";

};



interface DashboardRecommendationsProps {

  products: RecommendedProduct[];

}



export function DashboardRecommendations({ products }: DashboardRecommendationsProps) {

  if (products.length === 0) return null;



  return (

    <section className="dashboard-panel dashboard-recommendations">

      <div className="dashboard-panel-toolbar">

        <div>

          <h2 className="dashboard-panel-title">Recommended For You</h2>

          <p className="dashboard-panel-subtitle">Curated picks based on luxury bestsellers</p>

        </div>

        <Link href="/shop" className="dashboard-panel-link">

          Shop All

        </Link>

      </div>



      <div className="dashboard-reco-grid">

        {products.slice(0, 2).map((product) => (

          <ProductCard key={product.id} product={product} badge={product.badge} />

        ))}

      </div>

    </section>

  );

}


