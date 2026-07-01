"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatOrderDate } from "@/components/dashboard/OrderStatusBadge";
import { AdminPagination } from "./AdminOrdersTable";

export type AdminReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: string; name: string; slug: string; imageUrl: string | null };
};

type ReviewStats = {
  pending: number;
  approved: number;
  distribution: { star: number; count: number }[];
};

interface AdminReviewsClientProps {
  reviews: AdminReviewRow[];
  total: number;
  page: number;
  totalPages: number;
  stats: ReviewStats;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="admin-review-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "admin-review-star-filled" : "admin-review-star-empty"}
          fill={i < rating ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export function AdminReviewsClient({
  reviews,
  total,
  page,
  totalPages,
  stats,
}: AdminReviewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const status = searchParams.get("status") ?? "all";
  const [busyId, setBusyId] = useState<string | null>(null);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      router.push(`/admin/reviews?${params.toString()}`);
    });
  };

  const moderate = async (reviewId: string, isApproved: boolean) => {
    setBusyId(reviewId);
    try {
      const response = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Moderation failed");
        return;
      }

      toast.success(isApproved ? "Review approved" : "Review rejected");
      router.refresh();
    } catch {
      toast.error("Moderation failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (reviewId: string) => {
    if (!window.confirm("Delete this review permanently?")) return;

    setBusyId(reviewId);
    try {
      const response = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Delete failed");
        return;
      }

      toast.success("Review deleted");
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const maxDistribution = Math.max(...stats.distribution.map((d) => d.count), 1);

  return (
    <div className="admin-reviews-page">
      <p className="admin-page-intro">
        Moderate customer reviews. Only approved reviews appear on product pages and update product ratings.
      </p>

      <div className="admin-reviews-stats">
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Pending</p>
          <p className="admin-kpi-value">{stats.pending}</p>
        </div>
        <div className="admin-kpi-card">
          <p className="admin-kpi-label">Published</p>
          <p className="admin-kpi-value">{stats.approved}</p>
        </div>
        <div className="admin-kpi-card admin-reviews-distribution">
          <p className="admin-kpi-label">Rating distribution</p>
          <ul className="admin-reviews-dist-list">
            {stats.distribution.map(({ star, count }) => (
              <li key={star}>
                <span>{star}★</span>
                <div className="admin-reviews-dist-bar">
                  <span style={{ width: `${(count / maxDistribution) * 100}%` }} />
                </div>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="admin-toolbar-count">{total} reviews</p>
          <form
            className="admin-toolbar-search"
            onSubmit={(event) => {
              event.preventDefault();
              pushParams({ search: search.trim() || null, page: "1" });
            }}
          >
            <Search size={16} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reviews, products, customers…"
              aria-label="Search reviews"
            />
          </form>
          <select
            className="admin-toolbar-select"
            value={status}
            onChange={(event) => pushParams({ status: event.target.value, page: "1" })}
            disabled={isPending}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <section className="admin-card">
          <p className="admin-inline-empty">No reviews match your filters.</p>
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Review</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const imageUrl = resolveProductImageUrl(
                    review.product.imageUrl,
                    review.product.name,
                    review.product.slug
                  );

                  return (
                    <tr key={review.id}>
                      <td>
                        <div className="admin-table-product">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt=""
                            className="admin-table-product-image"
                          />
                          <Link
                            href={`/products/${review.product.slug}`}
                            className="admin-table-product-name"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {review.product.name}
                          </Link>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-customer">
                          <span className="admin-table-customer-name">
                            {review.user.name ?? "Customer"}
                          </span>
                          <span className="admin-table-muted">{review.user.email}</span>
                        </div>
                      </td>
                      <td>
                        <RatingStars rating={review.rating} />
                      </td>
                      <td className="admin-review-snippet">
                        {review.title && (
                          <p className="admin-review-snippet-title">{review.title}</p>
                        )}
                        {review.comment && (
                          <p className="admin-table-muted admin-review-snippet-body">
                            {review.comment}
                          </p>
                        )}
                        {review.isVerified && (
                          <span className="admin-review-verified">Verified purchase</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill${
                            review.isApproved ? " is-success" : " is-warning"
                          }`}
                        >
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="admin-table-muted">
                        {formatOrderDate(review.createdAt)}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          {!review.isApproved && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-table"
                              disabled={busyId === review.id}
                              onClick={() => moderate(review.id, true)}
                            >
                              Approve
                            </button>
                          )}
                          {review.isApproved && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-table"
                              disabled={busyId === review.id}
                              onClick={() => moderate(review.id, false)}
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-btn admin-btn-table admin-btn-table-ghost"
                            disabled={busyId === review.id}
                            onClick={() => remove(review.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/reviews"
        searchParams={{
          search: searchParams.get("search") ?? undefined,
          status: status !== "all" ? status : undefined,
        }}
      />

      <p className="admin-results-meta">
        Showing {reviews.length} of {total} reviews
      </p>
    </div>
  );
}
