import { useState, useEffect, useCallback } from "react"
import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, setShippingMethod, listCartOptions, initiatePaymentSession, retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods, calculatePriceForShippingOption } from "@lib/data/fulfillment"

type ShippingOption = HttpTypes.StoreCartShippingOption & {
  price_type?: string;
  amount?: number;
  actualCartTotal?: number;
};

interface ExpressCheckoutProps {
  cart: HttpTypes.StoreCart
  countryCode?: string
}

export default function ExpressCheckout({ cart, countryCode }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isElementReady, setIsElementReady] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [currentCart, setCurrentCart] = useState(cart)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Create payment intent with base cart amount - simple and safe approach
  useEffect(() => {
    const initializePayment = async () => {
      try {
        console.log("💳 Creating initial payment session with base cart:", currentCart.total)
        
        const paymentSessionResponse = await initiatePaymentSession(currentCart, {
          provider_id: "pp_stripe_stripe",
        })

        const paymentSession = paymentSessionResponse?.payment_collection?.payment_sessions?.[0]
        const initialClientSecret = paymentSession?.data?.client_secret as string

        if (initialClientSecret) {
          setClientSecret(initialClientSecret)
          console.log("✅ Initial payment session created with base amount:", currentCart.total)
        }
      } catch (error) {
        console.error("Failed to initialize payment session:", error)
        setError("Failed to initialize payment")
      }
    }

    if (currentCart?.id && !clientSecret) {
      initializePayment()
    }
  }, [currentCart?.id, clientSecret])

  // Handle shipping address changes with customer info collection
  const handleShippingAddressChange = useCallback(async (event: any) => {
    try {
      console.log("📍 Shipping address changed - Full event:", event)
      
      if (!event.address) {
        console.error("No shipping address provided")
        event.reject({ reason: 'invalid_shipping_address' })
        return
      }

      console.log("📍 Updating cart with shipping address...")
      console.log("👤 Customer info from event:", {
        email: event.email,
        phone: event.phone,
        name: event.name
      })
      
      const shippingData = {
        first_name: event.name?.givenName || "",
        last_name: event.name?.familyName || "",
        company: "", // Required string field
        address_1: event.address?.line1 || "",
        address_2: event.address?.line2 || "",
        city: event.address?.city || "",
        country_code: event.address?.country?.toLowerCase() || "",
        province: event.address?.state || "", // Required string field - state/province
        postal_code: event.address?.postal_code || "",
        phone: event.address?.phone || event.phone || ""
      }

      // Update cart with shipping address AND customer email
      const cartUpdates: any = {
        shipping_address: shippingData
      }

      // Add customer email if available (email goes to cart root, not address)
      if (event.email) {
        cartUpdates.email = event.email
        console.log("📧 Setting customer email:", event.email)
      }

      await updateCart(cartUpdates)

      // Get updated cart
      const freshCart = await retrieveCart(currentCart.id)
      
      if (!freshCart || !freshCart.shipping_address) {
        event.reject({ reason: 'invalid_shipping_address' })
        return
      }
      
      console.log("✅ Cart updated with address and customer info:", {
        email: freshCart.email,
        shipping_phone: freshCart.shipping_address?.phone
      })
      setCurrentCart(freshCart)
      
      // Get shipping methods for this address
      const shippingMethods = await listCartShippingMethods(freshCart.id)
        
      if (!shippingMethods || shippingMethods.length === 0) {
        console.warn("No shipping methods available")
        event.resolve({
          shippingRates: [{
            id: 'free-shipping',
            displayName: 'Free Shipping',
            amount: 0,
            deliveryEstimate: {
              minimum: { unit: 'business_day' as const, value: 5 },
              maximum: { unit: 'business_day' as const, value: 10 }
            }
          }]
        })
        return
      }

      // Calculate actual final prices for each shipping option
      const shippingRatesWithActualPricing = []
      
      for (const option of shippingMethods) {
        try {
          // Temporarily apply this shipping method to see the real final price
          await setShippingMethod({
            cartId: freshCart.id,
            shippingMethodId: option.id
          })
          
          // Get cart with this shipping method applied
          const cartWithShipping = await retrieveCart(freshCart.id)
          
          if (!cartWithShipping) {
            throw new Error("Failed to get cart with shipping")
          }

          // Store the cart with this shipping method for later use
          const shippingOptionWithTotal = {
            ...option,
            actualCartTotal: cartWithShipping.total,
            actualShippingTotal: cartWithShipping.shipping_total
          }
          
          setShippingOptions(prev => {
            const filtered = prev.filter(p => p.id !== option.id)
            return [...filtered, shippingOptionWithTotal]
          })

          // For Stripe, we need to show ONLY the shipping amount difference
          const shippingAmount = cartWithShipping.shipping_total || 0
          
          console.log(`📦 Shipping option "${option.name}":`, {
            originalAmount: option.amount,
            actualShippingAmount: shippingAmount,
            finalCartTotal: cartWithShipping.total,
            baseCartTotal: freshCart.total
          })

          shippingRatesWithActualPricing.push({
            id: option.id,
            displayName: option.name || 'Shipping',
            amount: Math.round(shippingAmount * 100), // Only the shipping cost in cents
            deliveryEstimate: {
              minimum: { unit: 'business_day' as const, value: 1 },
              maximum: { unit: 'business_day' as const, value: 7 }
            }
          })
            
        } catch (error) {
          console.error('Error calculating shipping for option:', option.name, error)
          // Fallback to original amount
          shippingRatesWithActualPricing.push({
            id: option.id,
            displayName: option.name || 'Shipping',
            amount: Math.round((option.amount || 0) * 100),
            deliveryEstimate: {
              minimum: { unit: 'business_day' as const, value: 3 },
              maximum: { unit: 'business_day' as const, value: 10 }
            }
          })
        }
      }

      console.log("📦 Providing shipping rates to Stripe:", shippingRatesWithActualPricing)
      
      // Resolve with calculated shipping rates
      event.resolve({
        shippingRates: shippingRatesWithActualPricing
      })
      
    } catch (error) {
      console.error('❌ Error handling shipping address change:', error)
      event.reject({ reason: 'invalid_shipping_address' })
    }
  }, [currentCart.id])

  // Handle shipping rate selection with PaymentIntent update
  const handleShippingRateChange = useCallback(async (event: any) => {
    try {
      console.log("🚚 Shipping rate selected:", event.shippingRate)
      
      if (event.shippingRate?.id) {
        // Set the shipping method on the cart
        await setShippingMethod({
          cartId: currentCart.id,
          shippingMethodId: event.shippingRate.id
        })
        
        // Get updated cart with final totals
        const updatedCart = await retrieveCart(currentCart.id)
        if (updatedCart) {
          setCurrentCart(updatedCart)
          
          console.log("💰 Updating PaymentIntent with new amount:", updatedCart.total)
          
          // CRITICAL: Create new payment session with updated cart total
          // This creates a new PaymentIntent with the correct amount
          const newPaymentSessionResponse = await initiatePaymentSession(updatedCart, {
            provider_id: "pp_stripe_stripe",
          })

          const newPaymentSession = newPaymentSessionResponse?.payment_collection?.payment_sessions?.[0]
          const newClientSecret = newPaymentSession?.data?.client_secret as string

          if (newClientSecret) {
            // Update the client secret with the new payment intent
            setClientSecret(newClientSecret)
            console.log("✅ PaymentIntent updated with new amount:", updatedCart.total)
          }
        }
      }
      
      // Always resolve to continue the flow
      event.resolve()
    } catch (error) {
      console.error('❌ Error handling shipping rate change:', error)
      // Still resolve to avoid blocking the UI
      event.resolve()
    }
  }, [currentCart.id])

  // Handle final payment confirmation with customer info collection
  const handleExpressCheckout = async (event: any) => {
    console.log("💳 Express checkout confirmed with full event data:", event)
    
    if (!stripe || !elements || !clientSecret) {
      setError("Payment not properly initialized")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Get the latest cart state
      const latestCart = await retrieveCart(currentCart.id)
      if (!latestCart) {
        throw new Error("Failed to retrieve cart")
      }

      console.log("📊 Final cart state:", {
        subtotal: latestCart.subtotal,
        shipping_total: latestCart.shipping_total,
        tax_total: latestCart.tax_total,
        total: latestCart.total,
        email: latestCart.email
      })

      // Collect customer information from the Express Checkout event
      const customerInfo: any = {}
      
      if (event.payerEmail) {
        customerInfo.email = event.payerEmail
        console.log("📧 Customer email from payerEmail:", event.payerEmail)
      }
      
      if (event.payerPhone) {
        customerInfo.phone = event.payerPhone
        console.log("📱 Customer phone from payerPhone:", event.payerPhone)
      }

      // Also check billing details for email/phone
      if (event.billingDetails) {
        if (event.billingDetails.email && !customerInfo.email) {
          customerInfo.email = event.billingDetails.email
          console.log("📧 Customer email from billingDetails:", event.billingDetails.email)
        }
        if (event.billingDetails.phone && !customerInfo.phone) {
          customerInfo.phone = event.billingDetails.phone
          console.log("📱 Customer phone from billingDetails:", event.billingDetails.phone)
        }
      }

      // Update cart with customer information if we have it
      if (customerInfo.email || customerInfo.phone) {
        console.log("👤 Updating cart with customer info:", customerInfo)
        
        const cartUpdates: any = {}
        
        // Email goes to the cart root level
        if (customerInfo.email) {
          cartUpdates.email = customerInfo.email
        }
        
        // Phone goes to the shipping address
        if (customerInfo.phone && latestCart.shipping_address) {
          // Only include allowed fields, exclude id and other system fields
          cartUpdates.shipping_address = {
            first_name: latestCart.shipping_address.first_name || "",
            last_name: latestCart.shipping_address.last_name || "",
            company: latestCart.shipping_address.company || "",
            address_1: latestCart.shipping_address.address_1 || "",
            address_2: latestCart.shipping_address.address_2 || "",
            city: latestCart.shipping_address.city || "",
            country_code: latestCart.shipping_address.country_code || "",
            province: latestCart.shipping_address.province || "",
            postal_code: latestCart.shipping_address.postal_code || "",
            phone: customerInfo.phone
          }
          console.log("📱 Adding phone to shipping address:", customerInfo.phone)
        }
        
        await updateCart(cartUpdates)
        
        // Get updated cart
        const updatedCart = await retrieveCart(latestCart.id)
        if (updatedCart) {
          console.log("✅ Cart updated with customer info:", {
            email: updatedCart.email,
            shipping_phone: updatedCart.shipping_address?.phone
          })
        }
      }

      // CRITICAL: We need to create a NEW payment intent with the correct total amount
      console.log("💳 Creating new payment session with final cart total:", latestCart.total)
      
      const finalPaymentSessionResponse = await initiatePaymentSession(latestCart, {
        provider_id: "pp_stripe_stripe",
      })

      const finalPaymentSession = finalPaymentSessionResponse?.payment_collection?.payment_sessions?.[0]
      const finalClientSecret = finalPaymentSession?.data?.client_secret as string

      if (!finalClientSecret) {
        throw new Error("Failed to create final payment session")
      }

      console.log("✅ Final payment session created with correct total:", latestCart.total)

      // Confirm payment with the correct amount
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: finalClientSecret, // Use the new client secret with correct amount
        confirmParams: {
          return_url: `${window.location.origin}/${countryCode || 'us'}/cart`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      // Place the order
      const orderResult = await placeOrder(latestCart.id)
      
      if (!orderResult?.id) {
        throw new Error("Failed to place order")
      }

      console.log("✅ Payment successful, redirecting to confirmation")
      
      // Redirect to confirmation
      window.location.href = `/${countryCode || 'us'}/order/${orderResult.id}/confirmed`
      
    } catch (error: any) {
      console.error("❌ Express checkout failed:", error)
      setError(error.message || "Express checkout failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!currentCart?.id || !clientSecret) {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-600">
          ⏳ Initializing payment...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded border">
          ❌ {error}
        </div>
      )}

      <div className="express-checkout-container">
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckout}
          onShippingAddressChange={handleShippingAddressChange}
          onShippingRateChange={handleShippingRateChange}
          options={{
            layout: {
              maxColumns: 1,
              maxRows: 1,
              overflow: 'auto',
            },
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
            // Enable customer info collection
            shippingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
            // Provide a realistic default shipping rate based on your actual costs
            // This gives users a better estimate before address entry
            shippingRates: [{
              id: 'estimated-shipping',
              displayName: 'Estimated Shipping',
              amount: 743, // $7.43 in cents (your actual increase: $17.43 - $10.90 = $6.53, but we add a bit more buffer)
              deliveryEstimate: {
                minimum: { unit: 'business_day' as const, value: 3 },
                maximum: { unit: 'business_day' as const, value: 7 }
              }
            }],
          }}
          onReady={(event) => {
            console.log("✅ ExpressCheckoutElement ready")
            setIsElementReady(true)
          }}
          onLoadError={(event) => {
            console.error("❌ ExpressCheckoutElement load error", event)
            setError("Failed to load express checkout options")
          }}
        />

        {isElementReady && (
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-sm text-gray-500 bg-background">or</span>
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