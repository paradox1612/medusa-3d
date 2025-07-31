"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, initiatePaymentSession, setShippingMethod, listCartOptions } from "@lib/data/cart"

interface ExpressCheckoutProps {
  cart: HttpTypes.StoreCart
  countryCode?: string
}

interface DebugInfo {
  [key: string]: {
    message: string
    data?: any
  }
}

export default function ExpressCheckout({ cart, countryCode }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [isElementReady, setIsElementReady] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])

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

  // Load shipping options when cart is available
  useEffect(() => {
    if (!cart?.id || shippingOptions.length > 0) return
    
    const loadShippingOptions = async () => {
      try {
        const options = await listCartOptions()
        setShippingOptions(options.shipping_options || [])
      } catch (error) {
        debug("Failed to load shipping options", error)
      }
    }
    
    loadShippingOptions()
  }, [cart?.id, debug, shippingOptions.length])

  const handleExpressCheckout = async (event: any) => {
    debug("Express checkout initiated", {
      event,
      stripe: !!stripe,
      elements: !!elements,
      paymentMethodType: event.expressPaymentType || 'unknown',
      shippingAddress: event.shippingAddress,
      shippingRate: event.shippingRate,
    })

    if (!stripe || !elements) {
      const errorMsg = "Stripe not loaded"
      setError(errorMsg)
      debug("Error: " + errorMsg)
      event.complete('fail')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Update cart with shipping and billing information from express checkout
      let updatedCart = cart
      
      // Extract shipping address from express checkout
      const shippingAddress = event.shippingAddress
      const billingAddress = event.billingAddress || event.shippingAddress
      
      if (shippingAddress) {
        const addressData: any = {
          shipping_address: {
            first_name: shippingAddress.recipient?.split(' ')[0] || event.payerName?.split(' ')[0] || 'Customer',
            last_name: shippingAddress.recipient?.split(' ').slice(1).join(' ') || event.payerName?.split(' ').slice(1).join(' ') || '',
            address_1: shippingAddress.addressLine?.[0] || '',
            address_2: shippingAddress.addressLine?.[1] || '',
            city: shippingAddress.city || '',
            country_code: shippingAddress.country?.toLowerCase() || '',
            postal_code: shippingAddress.postalCode || '',
            province: shippingAddress.region || '',
            phone: shippingAddress.phone || '',
          },
          billing_address: {
            first_name: billingAddress.recipient?.split(' ')[0] || event.payerName?.split(' ')[0] || 'Customer',
            last_name: billingAddress.recipient?.split(' ').slice(1).join(' ') || event.payerName?.split(' ').slice(1).join(' ') || '',
            address_1: billingAddress.addressLine?.[0] || shippingAddress.addressLine?.[0] || '',
            address_2: billingAddress.addressLine?.[1] || shippingAddress.addressLine?.[1] || '',
            city: billingAddress.city || shippingAddress.city || '',
            country_code: billingAddress.country?.toLowerCase() || shippingAddress.country?.toLowerCase() || '',
            postal_code: billingAddress.postalCode || shippingAddress.postalCode || '',
            province: billingAddress.region || shippingAddress.region || '',
            phone: billingAddress.phone || shippingAddress.phone || '',
          },
          email: event.payerEmail || '',
        }
        
        debug("Updating cart with express checkout address data", addressData)
        updatedCart = await updateCart(addressData)
      }

      // Set shipping method if a shipping option was selected
      if (event.shippingRate && updatedCart) {
        debug("Setting shipping method", event.shippingRate)
        await setShippingMethod({
          cartId: updatedCart.id,
          shippingMethodId: event.shippingRate.id
        })
      } else if (shippingOptions.length > 0 && updatedCart) {
        // Automatically select the first shipping option if none was selected
        debug("Auto-selecting first shipping option")
        await setShippingMethod({
          cartId: updatedCart.id,
          shippingMethodId: shippingOptions[0].id
        })
      }

      // Create payment session
      debug("Creating payment session for express checkout")
      const paymentSessionResponse = await initiatePaymentSession(updatedCart || cart, {
        provider_id: "pp_stripe_stripe",
      })
      const paymentSession = paymentSessionResponse.payment_collection?.payment_sessions?.[0]

      // Handle different possible response structures
      const clientSecret = paymentSession?.data?.client_secret
      
      if (!clientSecret) {
        throw new Error("Failed to create payment session - no client secret")
      }

      debug("Payment session created", {
        sessionId: paymentSession?.id,
        hasClientSecret: !!clientSecret,
        response: paymentSessionResponse
      })

      // For Express Checkout Element, we don't need to manually confirm payment
      // The payment is handled automatically by the express payment method
      debug("Express checkout payment handled by payment method")
      
      // Place the order and get the result
      debug("Placing order via express checkout...")
      const orderResult = await placeOrder()
      
      // The placeOrder function will automatically redirect to the order confirmation page
      // so we don't need to manually redirect here
      
    } catch (err: any) {
      const errorMsg = err.message || "Express checkout failed"
      debug("Express checkout error", err)
      setError(errorMsg)
      
      // Reject the payment if there was an error
      event.complete('fail')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShippingAddressChange = useCallback(
    async (event: any) => {
      debug("Shipping address changed", event)
      
      // For Express Checkout Element, we don't handle shipping rates here
      // The payment methods (Apple Pay, Google Pay) will handle shipping internally
      event.resolve({ status: 'success' })
    },
    [debug]
  )

  const handleShippingRateChange = useCallback(
    (event: any) => {
      debug("Shipping rate changed", event)
      event.resolve({ status: 'success' })
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
          onConfirm={handleExpressCheckout}
          options={{
            buttonTheme: {
              applePay: "black",
              googlePay: "black",
              paypal: "gold",
            },
            buttonType: {
              applePay: "buy",
              googlePay: "buy", 
              paypal: "buynow",
            },
            buttonHeight: 48,
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
          onShippingAddressChange={handleShippingAddressChange}
          onShippingRateChange={handleShippingRateChange}
        />
        {isElementReady && (
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500 bg-background">
              or
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