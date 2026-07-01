"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductReviewFormProps {
  productId: string;
}

export function ProductReviewForm({ productId }: ProductReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "Could not submit review");
        return;
      }

      toast.success("Review submitted — pending moderation");
      setTitle("");
      setComment("");
      setRating(5);
      router.refresh();
    } catch {
      toast.error("Could not submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="pdp-review-form" onSubmit={submit}>
      <h3 className="pdp-review-form-title">Write a Review</h3>
      <p className="pdp-review-form-subtitle">
        Share your experience with this fragrance. Reviews are published after moderation.
      </p>

      <fieldset className="pdp-review-form-field">
        <legend className="pdp-review-form-label">Your rating</legend>
        <div className="pdp-review-form-stars">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                className="pdp-review-form-star-btn"
                aria-label={`Rate ${value} out of 5`}
                onClick={() => setRating(value)}
              >
                <Star
                  size={18}
                  className={
                    value <= rating
                      ? "text-[#C8A96B] fill-[#C8A96B]"
                      : "text-[rgba(200,169,107,0.25)]"
                  }
                />
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="pdp-review-form-field">
        <span className="pdp-review-form-label">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          placeholder="Summarize your experience"
          className="pdp-review-form-input"
        />
      </label>

      <label className="pdp-review-form-field">
        <span className="pdp-review-form-label">Review</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={2000}
          required
          rows={5}
          placeholder="Tell others what you loved about this scent…"
          className="pdp-review-form-textarea"
        />
      </label>

      <button type="submit" className="pdp-review-form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

interface ProductReviewPromptProps {
  isLoggedIn: boolean;
  canReview: boolean;
  hasReview: boolean;
  isApproved: boolean;
  productId: string;
}

export function ProductReviewPrompt({
  isLoggedIn,
  canReview,
  hasReview,
  isApproved,
  productId,
}: ProductReviewPromptProps) {
  if (canReview) {
    return <ProductReviewForm productId={productId} />;
  }

  if (hasReview) {
    return (
      <div className="pdp-review-form-notice">
        <p>
          {isApproved
            ? "Thank you — your review is published."
            : "Your review is pending moderation and will appear once approved."}
        </p>
        <Link href="/dashboard/reviews" className="pdp-review-form-link">
          View my reviews
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="pdp-review-form-notice">
        <p>Sign in and purchase this fragrance to leave a verified review.</p>
        <Link href="/login" className="pdp-review-form-link">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="pdp-review-form-notice">
      <p>Only verified purchasers can review this product.</p>
      <Link href="/shop" className="pdp-review-form-link">
        Shop fragrances
      </Link>
    </div>
  );
}
