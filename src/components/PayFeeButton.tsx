"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface PayFeeButtonProps {
  feeId: string;
  amount: number;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayFeeButton({ feeId, amount }: PayFeeButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handlePay() {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeId }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Couldn't start the payment.");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Couldn't load the payment widget. Check your connection and try again.");
      }

      const rzp = new window.Razorpay({
        key: body.keyId,
        amount: body.order.amount,
        currency: body.order.currency,
        order_id: body.order.id,
        name: "Fee payment",
        description: `Fee ${feeId}`,
        handler: () => {
          setStatus("idle");
          setMessage("Payment complete. It may take a minute to reflect here.");
        },
      });
      rzp.open();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handlePay}
        disabled={status === "loading"}
        className="rounded-sm bg-red-pen text-paper px-5 py-2 font-medium hover:bg-red-pen-dark transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Starting…" : `Pay ₹${amount.toLocaleString("en-IN")}`}
      </button>
      {message && (
        <p className={`text-xs mt-2 max-w-[220px] ${status === "error" ? "text-red-pen" : "text-ink-soft"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
