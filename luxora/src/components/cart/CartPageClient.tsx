"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { useCart } from "./CartProvider";
import { CartTableRow } from "./CartTableRow";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { CartTrustBar } from "./CartTrustBar";

export function CartPageClient() {
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();
  const isEmpty = !isLoading && items.length === 0;

  return (
    <div className="cart-page w-full min-w-0">
      <PageSection className="cart-page-section">
        <SiteContainer>
          <header className="cart-page-header">
            <div>
              <h1 className="cart-page-title">Your Cart</h1>
              <nav className="cart-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden="true">&gt;</span>
                <span>Your Cart</span>
              </nav>
            </div>
          </header>

          {isLoading ? (
            <div className="cart-loading">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="cart-loading-row" aria-hidden />
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="cart-layout">
              <div className="cart-main">
                <div className="cart-table-panel">
                  <div className="cart-table-head" aria-hidden="true">
                    <span>Product</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Total</span>
                    <span className="sr-only">Remove</span>
                  </div>
                  <div className="cart-table-body">
                    {items.map((item) => (
                      <CartTableRow
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                </div>

                <Link href="/shop" className="cart-continue-link">
                  <ArrowLeft size={14} strokeWidth={1.75} />
                  Continue Shopping
                </Link>
              </div>

              <CartSummary subtotal={subtotal} />
            </div>
          )}
        </SiteContainer>
      </PageSection>

      <CartTrustBar />
    </div>
  );
}
