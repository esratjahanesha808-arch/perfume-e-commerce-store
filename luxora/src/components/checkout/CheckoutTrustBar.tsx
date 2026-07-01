import { ShieldCheck, Truck, Tag, Headphones } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "100% Authentic", sub: "Original & Trusted" },
  { icon: Truck, title: "Fast Delivery", sub: "Worldwide Shipping" },
  { icon: Tag, title: "Exclusive Offers", sub: "For Our Members" },
  { icon: Headphones, title: "Expert Support", sub: "We're here to help" },
];

export function CheckoutTrustBar() {
  return (
    <section className="checkout-trust-bar" aria-label="Shopping benefits">
      <div className="site-container">
        <div className="checkout-trust-grid">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="checkout-trust-item">
              <Icon size={20} strokeWidth={1.5} className="checkout-trust-icon" />
              <div>
                <p className="checkout-trust-title">{title}</p>
                <p className="checkout-trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
