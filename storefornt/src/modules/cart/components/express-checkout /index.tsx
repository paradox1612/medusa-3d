"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"

interface ExpressCheckoutProps {
  cart: HttpTypes.StoreCart
}

interface DebugInfo {
  [key: string]: {
    message: string
    data?: any
  }
}

export default function ExpressCheckout({ cart }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [isElementReady, setIsElementReady] = useState(false)

  // Debug function with useCallback to prevent recreation on every render
  const debug = useCallback((message: string, data?: any) => {
    console.log(`[Express Checkout Debug] ${message}`, data)
    setDebugInfo((prev: DebugInfo) => ({
      ...prev,
      [new Date().toISOString()]: { message, data },
    }))
  }, [])

  // Move debug calls into useEffect to prevent render loops
  useEffect(() => {
    if (!cart?.id) {
      debug("No cart available")
      return
    }

    debug("ExpressCheckout component mounted", {
      cartId: cart.id,
      total: cart.total,
      currency: cart.currency_code,
    })
  }, [cart.id, cart.total, cart.currency_code, debug])

  const handleExpressCheckout = async (event: any) => {
    debug("Express checkout initiated", {
      event,
      stripe: !!stripe,
      elements: !!elements,
    })

    if (!stripe || !elements) {
      const errorMsg = "Stripe not loaded"
      setError(errorMsg)
      debug("Error: " + errorMsg)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      debug("Starting payment confirmation...")

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout?step=confirmation`,
          },
          redirect: "if_required",
        })

      debug("Payment confirmation result", {
        error: confirmError,
        paymentIntent: paymentIntent
          ? {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
            }
          : null,
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === "succeeded") {
        debug("Payment succeeded, redirecting to confirmation...")

        // Redirect to confirmation page for final review and order placement
        window.location.href = `/checkout?step=confirmation`
      }
    } catch (err: any) {
      const errorMsg = err.message || "Payment failed"
      debug("Express checkout error", err)
      setError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExpressCheckoutClick = useCallback(
    (event: any) => {
      debug("Express checkout button clicked", event)
      handleExpressCheckout(event)
    },
    [debug]
  )

  // Don't show if no cart
  if (!cart?.id) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Development Debug Info */}
      {false && (
        <div className="bg-gray-100 p-3 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-medium">
              🔧 Debug Info (Dev Only)
            </summary>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Cart ID:</strong> {cart.id}
              </p>
              <p>
                <strong>Total:</strong> {cart.total} {cart.currency_code}
              </p>
              <p>
                <strong>Stripe Loaded:</strong> {stripe ? "✅" : "❌"}
              </p>
              <p>
                <strong>Elements Loaded:</strong> {elements ? "✅" : "❌"}
              </p>
              <p>
                <strong>Processing:</strong> {isProcessing ? "Yes" : "No"}
              </p>
              {Object.keys(debugInfo).length > 0 && (
                <details className="mt-2">
                  <summary>Debug Log</summary>
                  <pre className="text-xs overflow-auto max-h-32 bg-white p-2 rounded">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded border">
          ❌ {error}
        </div>
      )}

      {/* Official Stripe Express Checkout Element */}
      <div className="express-checkout-container flex flex-col">
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckoutClick}
          options={{
            buttonTheme: {
              applePay: "black",
              googlePay: "black",
            },
            buttonType: {
              applePay: "buy",
              googlePay: "buy",
            },
            buttonHeight: 48,
          }}
          onReady={(event) => {
            debug("ExpressCheckoutElement ready", event)
            setIsElementReady(true)
          }}
          onLoadError={(event) => {
            debug("ExpressCheckoutElement load error", event)
            setError("Failed to load express checkout options")
          }}
        />
        {isElementReady && (
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500 bg-background">
              oder
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          ⏳ Processing payment...
        </div>
      )}
    </div>
  )
}