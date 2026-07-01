import Link from "next/link";
import { Star } from "lucide-react";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatOrderDate } from "@/components/dashboard/OrderStatusBadge";

type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: Date;
  product: {
    name: string;
    slug: string;
    images: { url: string; altText: string | null }[];
  };
};

interface DashboardReviewsListProps {
  reviews: ReviewItem[];
}

export function DashboardReviewsList({ reviews }: DashboardReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="dashboard-empty">
        <p className="dashboard-empty-title">No reviews yet</p>
        <p className="dashboard-empty-text">
          Purchase a fragrance and share your experience with the Luxora community.
        </p>
        <Link href="/shop" className="dashboard-empty-btn">
          Shop Fragrances
        </Link>
      </div>
    );
  }

  return (
    <ul className="dashboard-reviews-list stack-gap-cards">
      {reviews.map((review) => {
        const imageUrl = resolveProductImageUrl(
          review.product.images[0]?.url,
          review.product.name,
          review.product.slug
        );

        return (
          <li key={review.id} className="dashboard-review-card">
            <div className="dashboard-review-head">
              <Link href={`/products/${review.product.slug}`} className="dashboard-review-product">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={review.product.name} className="dashboard-review-image" />
                <div className="min-w-0">
                  <p className="dashboard-review-name">{review.product.name}</p>
                  <p className="dashboard-review-date">{formatOrderDate(review.createdAt)}</p>
                </div>
              </Link>
              <div className="dashboard-review-rating" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < review.rating ? "text-[#C8A96B]" : "text-[#C8A96B]/25"}
                    fill={i < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>

            {review.title && <p className="dashboard-review-title">{review.title}</p>}
            {review.comment && <p className="dashboard-review-comment">{review.comment}</p>}

            <p className="dashboard-review-status">
              {review.isApproved ? "Published" : "Pending moderation"}
              {review.isVerified ? " · Verified purchase" : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
