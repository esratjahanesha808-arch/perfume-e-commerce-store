"use client";

const STEPS = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
] as const;

interface CheckoutStepperProps {
  activeStep?: 1 | 2 | 3;
}

export function CheckoutStepper({ activeStep = 1 }: CheckoutStepperProps) {
  return (
    <nav className="checkout-stepper" aria-label="Checkout progress">
      <ol className="checkout-stepper-list">
        {STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          const isComplete = step.id < activeStep;

          return (
            <li key={step.id} className="checkout-stepper-item">
              <div className="checkout-stepper-node-wrap">
                <span
                  className={`checkout-stepper-node${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.id}
                </span>
                <span className={`checkout-stepper-label${isActive ? " is-active" : ""}`}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span className="checkout-stepper-line" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
