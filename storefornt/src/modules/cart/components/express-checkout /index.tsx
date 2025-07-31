"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, initiatePaymentSession } from "@lib/data/cart"

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
      paymentMethodType: event.expressPaymentType || 'unknown',
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
      // Update cart with shipping and billing information from express checkout
      let updatedCart = cart
      if (event.shippingAddress) {
        const addressData = {
          shipping_address: {
            first_name: event.shippingAddress.recipient?.split(' ')[0] || 'Customer',
            last_name: event.shippingAddress.recipient?.split(' ').slice(1).join(' ') || '',
            address_1: event.shippingAddress.addressLine[0] || '',
            address_2: event.shippingAddress.addressLine[1] || '',
            city: event.shippingAddress.city || '',
            country_code: event.shippingAddress.country?.toLowerCase() || '',
            postal_code: event.shippingAddress.postalCode || '',
            province: event.shippingAddress.region || '',
            phone: event.shippingAddress.phone || '',
          },
          email: event.payerEmail || event.payerName || '',
        }

        // Use billing address same as shipping for express checkout
        addressData.billing_address = { ...addressData.shipping_address }
        
        debug("Updating cart with express checkout address data", addressData)
        
        updatedCart = await updateCart(addressData)
      }

      // Now create payment session with the updated cart
      debug("Creating payment session for express checkout")
      const paymentSession = await initiatePaymentSession(updatedCart || cart, {
        provider_id: "pp_stripe_stripe",
      })

      if (!paymentSession?.data?.client_secret) {
        throw new Error("Failed to create payment session")
      }

      debug("Payment session created", {
        sessionId: paymentSession.id,
        hasClientSecret: !!paymentSession.data.client_secret,
      })

      // Confirm the payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentSession.data.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/${cart.region?.iso_2}/order/confirmed`,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      debug("Payment confirmed", {
        paymentIntentId: paymentIntent?.id,
        status: paymentIntent?.status,
      })

      // Complete the express checkout event
      event.complete('success')
      
      // Place the order
      debug("Placing order via express checkout...")
      await placeOrder()
      
    } catch (err: any) {
      const errorMsg = err.message || "Express checkout failed"
      debug("Express checkout error", err)
      setError(errorMsg)
      
      // Reject the payment if there was an error
      if (event.complete) {
        event.complete('fail')
      }
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
              paypal: "gold",
              amazonPay: "gold",
            },
            buttonType: {
              applePay: "buy",
              googlePay: "buy", 
              paypal: "buynow",
              amazonPay: "buynow",
            },
            buttonHeight: 48,
            requestShipping: true,
            requestPayerName: true,
            requestPayerEmail: true,
            layout: {
              maxColumns: 1,
              maxRows: 1,
              overflow: 'auto',
            },
          }}
          onReady={(event) => {
            debug("ExpressCheckoutElement ready", event)
            setIsElementReady(true)
          }}
          onLoadError={(event) => {
            debug("ExpressCheckoutElement load error", event)
            setError("Failed to load express checkout options")
          }}
          onShippingAddressChange={(event) => {
            debug("Shipping address changed", event)
            // You can add shipping rate calculation here if needed
            event.resolve({ status: 'success' })
          }}
          onShippingRateChange={(event) => {
            debug("Shipping rate changed", event)
            event.resolve({ status: 'success' })
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