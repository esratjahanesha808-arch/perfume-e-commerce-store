"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User, Search, Heart, ShoppingBag,
  Truck, Menu, X,
} from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useCart } from "@/components/cart/CartProvider";

const NAV_LINKS = [
  { label: "Home",     href: "/" },
  { label: "Shop",     href: "/shop" },
  { label: "Brands",   href: "/brands" },
  { label: "About Us", href: "/about" },
];

export function Header() {
  const { data: session, status } = useSession();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-border-dark transition-all duration-300 ${
          scrolled ? "glass shadow-md" : "bg-background"
        }`}
      >
        <div className="site-container h-[4.5rem] flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex flex-col items-center shrink-0 group"
            aria-label="Luxora – home"
          >
            <span className="text-gold-gradient font-serif text-[1.6rem] lg:text-[1.875rem] font-bold tracking-widest leading-none">
              LUXORA
            </span>
            <span className="text-gold text-[7px] tracking-[0.32em] uppercase mt-[3px]">
              Scent of Luxury
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 justify-center"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12.5px] xl:text-[13px] font-medium tracking-[0.1em] uppercase text-text-secondary hover:text-gold border-b border-transparent hover:border-gold pb-[2px] transition-all duration-150 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 lg:gap-5 text-text-primary shrink-0">
            {searchOpen ? (
              <form action="/shop" method="GET" className="flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  name="q"
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  className="w-32 lg:w-48 bg-transparent border-b border-gold text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none py-1 mr-2"
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      setTimeout(() => setSearchOpen(false), 200);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="hover:text-gold transition-colors duration-150"
                  aria-label="Close search"
                >
                  <X size={19} strokeWidth={1.5} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hover:text-gold transition-colors duration-150"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>
            )}

            {status === "loading" ? (
              <div className="w-[18px] h-[18px] rounded-full border-2 border-gold border-t-transparent animate-spin" />
            ) : session ? (
              <div className="group relative">
                <button
                  type="button"
                  className="hover:text-gold transition-colors duration-150"
                  aria-label="Account"
                  aria-haspopup="true"
                >
                  <User size={19} strokeWidth={1.5} />
                </button>
                <div className="header-account-menu" role="menu">
                  {(session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN") && (
                    <Link href="/admin" className="header-account-item" role="menuitem">
                      Admin
                    </Link>
                  )}
                  <Link href="/dashboard" className="header-account-item" role="menuitem">
                    My Account
                  </Link>
                  <div className="header-account-divider" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="header-account-item header-account-signout"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hover:text-gold transition-colors duration-150" aria-label="Sign in">
                <User size={19} strokeWidth={1.5} />
              </Link>
            )}

            <Link
              href="/wishlist"
              className="hover:text-gold transition-colors duration-150 relative"
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-[7px] bg-gold text-background text-[8px] font-bold h-[15px] min-w-[15px] px-0.5 rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="hover:text-gold transition-colors duration-150 relative"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-[7px] bg-gold text-background text-[8px] font-bold h-[15px] min-w-[15px] px-0.5 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden hover:text-gold transition-colors duration-150 ml-1"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen
                ? <X    size={22} strokeWidth={1.5} />
                : <Menu size={22} strokeWidth={1.5} />
              }
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        className={`mobile-nav-drawer fixed top-0 right-0 z-50 lg:hidden transition-transform duration-[320ms] ease-[var(--ease-luxury)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mobile-nav-header">
          <Link href="/" onClick={closeMobile} className="flex flex-col items-start">
            <span className="text-gold-gradient font-serif text-2xl font-bold tracking-widest leading-none">
              LUXORA
            </span>
            <span className="text-gold text-[8px] tracking-[0.3em] uppercase mt-1">
              Scent of Luxury
            </span>
          </Link>
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-gold"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mobile-nav-body" aria-label="Mobile navigation">
          <ul role="list" className="mobile-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMobile}
                  className="mobile-nav-link"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-nav-auth">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className="btn btn-outline-gold btn-full mobile-nav-btn"
                >
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={() => { signOut(); closeMobile(); }}
                  className="btn btn-ghost btn-full mobile-nav-btn"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} className="btn btn-solid-gold btn-full mobile-nav-btn">
                  Sign In
                </Link>
                <Link href="/register" onClick={closeMobile} className="btn btn-outline-gold btn-full mobile-nav-btn">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="mobile-nav-footer">
          <div className="mobile-nav-footer-note">
            <Truck size={14} className="text-gold shrink-0" />
            <span>Free shipping on orders over $99</span>
          </div>
        </div>
      </div>
    </>
  );
}
