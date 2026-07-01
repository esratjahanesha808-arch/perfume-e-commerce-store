import {
  ShieldCheck,
  Truck,
  Tag,
  RotateCcw,
  Lock,
} from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "100% Authentic", sub: "Original & Trusted" },
  { icon: Truck, title: "Fast Delivery", sub: "Worldwide Shipping" },
  { icon: Tag, title: "Exclusive Offers", sub: "For Our Members" },
  { icon: RotateCcw, title: "Easy Returns", sub: "14 Day Returns" },
  { icon: Lock, title: "Secure Payment", sub: "Safe & Encrypted" },
];

export function CartTrustBar() {
  return (
    <section className="cart-trust-bar" aria-label="Shopping benefits">
      <div className="site-container">
        <div className="cart-trust-grid">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="cart-trust-item">
              <Icon size={20} strokeWidth={1.5} className="cart-trust-icon" />
              <div>
                <p className="cart-trust-title">{title}</p>
                <p className="cart-trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
