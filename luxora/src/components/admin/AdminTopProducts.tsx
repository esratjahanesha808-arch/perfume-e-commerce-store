import Link from "next/link";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";

export type AdminTopProduct = {
  id: string;
  name: string;
  slug?: string;
  imageUrl: string | null;
  quantitySold: number;
  revenue: number;
};

interface AdminTopProductsProps {
  products: AdminTopProduct[];
}

export function AdminTopProducts({ products }: AdminTopProductsProps) {
  return (
    <section className="admin-card admin-top-list">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Top Selling Products</h2>
          <p className="admin-card-subtitle">Best performers this period</p>
        </div>
        <Link href="/admin/products" className="admin-card-link">
          View All
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="admin-inline-empty">No product sales in this period.</p>
      ) : (
        <ul className="admin-ranked-list">
          {products.map((product) => {
            const imageUrl = resolveProductImageUrl(
              product.imageUrl,
              product.name,
              product.slug
            );

            return (
              <li key={product.id} className="admin-ranked-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="admin-ranked-image" />
                <div className="admin-ranked-info min-w-0">
                  <p className="admin-ranked-name">{product.name}</p>
                  <p className="admin-ranked-meta">{product.quantitySold} sold</p>
                </div>
                <p className="admin-ranked-value">{formatPrice(product.revenue)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
