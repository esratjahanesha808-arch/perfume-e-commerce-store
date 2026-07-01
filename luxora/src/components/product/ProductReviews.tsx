"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductDetail } from "@/types/product";
import {
  resolveProductReviews,
  getReviewSummary,
  formatReviewDate,
} from "@/lib/product-reviews";
import { ProductReviewPrompt } from "./ProductReviewForm";

interface ProductReviewsProps {
  product: ProductDetail;
  reviewEligibility: {
    isLoggedIn: boolean;
    canReview: boolean;
    hasReview: boolean;
    isApproved: boolean;
  };
}

export function ProductReviews({ product, reviewEligibility }: ProductReviewsProps) {
  const initialReviews = resolveProductReviews(product);
  const [reviews, setReviews] = useState(initialReviews);
  const [helpfulBusyId, setHelpfulBusyId] = useState<string | null>(null);
  const { rating, count, distribution } = getReviewSummary(product, reviews);
  const fullStars = Math.floor(rating);

  const markHelpful = async (reviewId: string) => {
    if (reviewId.startsWith("dummy-")) {
      toast.message("Sample reviews cannot receive votes");
      return;
    }

    setHelpfulBusyId(reviewId);
    try {
      const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Could not update helpful count");
        return;
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: payload.data.helpfulCount }
            : review
        )
      );
    } catch {
      toast.error("Could not update helpful count");
    } finally {
      setHelpfulBusyId(null);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="w-full">
      <div className="flex flex-col xl:flex-row xl:items-start gap-12 xl:gap-16 2xl:gap-20">
        <div className="xl:w-[280px] shrink-0 min-w-0">
          <h2
            id="reviews-heading"
            className="font-serif text-xl md:text-2xl tracking-[0.12em] text-[#F3EFE6] uppercase pdp-headline-gap"
          >
            Customer Reviews
          </h2>

          <div className="flex items-end gap-4 pdp-headline-gap">
            <span className="font-serif text-5xl text-[#C8A96B] leading-none tabular-nums">
              {rating.toFixed(1)}
            </span>
            <div className="pb-1">
              <div className="flex items-center gap-1" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < fullStars
                        ? "text-[#C8A96B] fill-[#C8A96B]"
                        : "text-[rgba(200,169,107,0.25)]"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-[#A1A1A1] mt-3">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="stack-gap-sm pt-2">
            {distribution.map(({ star, percent }) => (
              <div key={star} className="flex items-center gap-3 text-[11px] py-1">
                <span className="w-3 text-[#A1A1A1] tabular-nums">{star}</span>
                <Star size={10} className="text-[#C8A96B] fill-[#C8A96B] shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C8A96B] transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#6B6B6B] tabular-nums">{percent}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 stack-gap-cards">
          <ProductReviewPrompt
            isLoggedIn={reviewEligibility.isLoggedIn}
            canReview={reviewEligibility.canReview}
            hasReview={reviewEligibility.hasReview}
            isApproved={reviewEligibility.isApproved}
            productId={product.id}
          />

          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="pdp-content-card rounded-md border border-[rgba(200,169,107,0.12)] bg-[rgba(22,22,22,0.6)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-7 md:mb-8">
                <div className="pdp-icon-row">
                  <div className="w-10 h-10 rounded-full bg-[rgba(172,125,69,0.15)] border border-[rgba(200,169,107,0.2)] flex items-center justify-center text-[#C8A96B] text-sm font-semibold uppercase shrink-0">
                    {(review.user.name ?? "Guest").charAt(0)}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-[#F3EFE6]">
                      {review.user.name ?? "Verified Customer"}
                    </p>
                    <p className="text-[10px] text-[#6B6B6B] tracking-wide mt-1.5">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-emerald-500 font-bold">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  )}
                  <div className="flex items-center gap-0.5" aria-label={`${review.rating} stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={
                          i < review.rating
                            ? "text-[#C8A96B] fill-[#C8A96B]"
                            : "text-[rgba(200,169,107,0.2)]"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              {review.title && (
                <h3 className="text-sm md:text-base font-semibold text-[#F3EFE6] mb-4 tracking-wide">
                  {review.title}
                </h3>
              )}
              {review.comment && (
                <p className="text-sm md:text-[15px] text-[#A1A1A1] leading-[1.75]">
                  {review.comment}
                </p>
              )}

              <button
                type="button"
                className="mt-8 md:mt-10 inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.14em] text-[#6B6B6B] hover:text-[#C8A96B] transition-colors disabled:opacity-50"
                disabled={helpfulBusyId === review.id}
                onClick={() => markHelpful(review.id)}
              >
                <ThumbsUp size={12} />
                Helpful ({review.helpfulCount})
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
