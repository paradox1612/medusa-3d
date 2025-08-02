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

  // Create payment intent with estimated total including shipping
  useEffect(() => {
    const initializePaymentWithShipping = async () => {
      try {
        console.log("💳 Pre-calculating shipping to create accurate PaymentIntent...")
        
        // First, try to set a default shipping method to get accurate pricing
        if (!currentCart.shipping_address) {
          // Set a default US address to get shipping calculation
          console.log("📍 Setting default address for shipping calculation...")
          
          const defaultShippingData = {
            first_name: "John",
            last_name: "Doe", 
            address_1: "123 Main St",
            city: "New York",
            country_code: "us",
            postal_code: "10001",
            phone: ""
          }
          
          await updateCart({
            shipping_address: defaultShippingData
          })
        }
        
        // Get updated cart with address
        const cartWithAddress = await retrieveCart(currentCart.id)
        
        if (cartWithAddress) {
          // Get shipping methods and set the first one
          const shippingMethods = await listCartShippingMethods(cartWithAddress.id)
          
          if (shippingMethods && shippingMethods.length > 0) {
            await setShippingMethod({
              cartId: cartWithAddress.id,
              shippingMethodId: shippingMethods[0].id
            })
            
            // Get final cart with shipping applied
            const finalCart = await retrieveCart(cartWithAddress.id)
            
            if (finalCart) {
              console.log("📊 Creating PaymentIntent with accurate total:", finalCart.total)
              
              // Now create payment session with the real total
              const paymentSessionResponse = await initiatePaymentSession(finalCart, {
                provider_id: "pp_stripe_stripe",
              })

              const paymentSession = paymentSessionResponse?.payment_collection?.payment_sessions?.[0]
              const initialClientSecret = paymentSession?.data?.client_secret as string

              if (initialClientSecret) {
                setClientSecret(initialClientSecret)
                setCurrentCart(finalCart)
                console.log("✅ PaymentIntent created with realistic total:", finalCart.total)
                return
              }
            }
          }
        }
        
        // Fallback to original method if shipping calculation fails
        console.log("⚠️ Falling back to base cart amount")
        const paymentSessionResponse = await initiatePaymentSession(currentCart, {
          provider_id: "pp_stripe_stripe",
        })

        const paymentSession = paymentSessionResponse?.payment_collection?.payment_sessions?.[0]
        const initialClientSecret = paymentSession?.data?.client_secret as string

        if (initialClientSecret) {
          setClientSecret(initialClientSecret)
          console.log("✅ Fallback PaymentIntent created with base amount:", currentCart.total)
        }
        
      } catch (error) {
        console.error("Failed to initialize payment session:", error)
        setError("Failed to initialize payment")
      }
    }

    if (currentCart?.id && !clientSecret) {
      initializePaymentWithShipping()
    }
  }, [currentCart?.id, clientSecret])

  // Handle shipping address changes following Stripe's pattern
  const handleShippingAddressChange = useCallback(async (event: any) => {
    try {
      console.log("📍 Shipping address changed - Stripe event:", event)
      
      if (!event.address) {
        console.error("No shipping address provided")
        event.reject({ reason: 'invalid_shipping_address' })
        return
      }

      console.log("📍 Updating cart with shipping address...")
      
      const shippingData = {
        first_name: event.name?.givenName || "",
        last_name: event.name?.familyName || "",
        address_1: event.address?.line1 || "",
        address_2: event.address?.line2 || "",
        city: event.address?.city || "",
        country_code: event.address?.country?.toLowerCase() || "",
        postal_code: event.address?.postal_code || "",
        phone: event.address?.phone || ""
      }

      // Update cart with shipping address
      await updateCart({
        shipping_address: shippingData
      })

      // Get updated cart
      const freshCart = await retrieveCart(currentCart.id)
      
      if (!freshCart || !freshCart.shipping_address) {
        event.reject({ reason: 'invalid_shipping_address' })
        return
      }
      
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
          // The base cart amount is already in the payment intent
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

  // Handle final payment confirmation
  const handleExpressCheckout = async (event: any) => {
    console.log("💳 Express checkout confirmed")
    
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
        total: latestCart.total
      })

      // Use the current client secret which should have the updated amount
      console.log("💳 Confirming payment with updated PaymentIntent")

      // Confirm payment with the updated payment intent
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret, // This should now have the correct amount
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
            // Enable shipping address collection
            shippingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
            // Don't provide initial shipping rates - let the address change event handle it
            // This prevents Google Pay from showing confusing shipping options
            shippingRates: [],
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