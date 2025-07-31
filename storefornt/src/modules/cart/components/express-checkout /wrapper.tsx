"use client"

import React from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import type { HttpTypes } from "@medusajs/types"
import ExpressCheckout from "./index"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "")

interface ExpressCheckoutWrapperProps {
  cart: HttpTypes.StoreCart
  countryCode?: string
}

export default function ExpressCheckoutWrapper({
  cart,
  countryCode,
}: ExpressCheckoutWrapperProps) {
  // Don't render if no cart or cart is empty
  if (!cart?.id || !cart.items?.length) {
    return null
  }

  // Check if Stripe is configured
  if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
          ⚠️ <strong>Missing Stripe Configuration:</strong>
          <br />
          Add NEXT_PUBLIC_STRIPE_KEY to your .env.local file
        </div>
      )
    }
    return null
  }

  // Stripe Elements options for Express Checkout - using Payment Request approach
  const options = {
    mode: "payment" as const,
    amount: Math.round((cart.total || 0) * 100), // Convert to cents
    currency: cart.currency_code?.toLowerCase() || "usd",
    appearance: {
      theme: "stripe" as const,
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <ExpressCheckout cart={cart} countryCode={countryCode} />
    </Elements>
  )
}