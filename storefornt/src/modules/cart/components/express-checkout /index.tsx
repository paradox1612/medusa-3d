import { useState, useEffect, useCallback } from "react"
import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, setShippingMethod, listCartOptions, initiatePaymentSession, retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods, calculatePriceForShippingOption } from "@lib/data/fulfillment"

type ShippingOption = HttpTypes.StoreCartShippingOption & {
  price_type?: string;
  amount?: number;
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

  // Load initial shipping options only if cart has shipping address
  useEffect(() => {
    if (!currentCart?.id || !currentCart.shipping_address) return

    const loadShippingOptions = async () => {
      try {
        console.log("🚚 Loading shipping options for cart:", currentCart.id)
        
        // Use your existing method with the correct approach
        const options = await listCartShippingMethods(currentCart.id)
        console.log("📦 Raw shipping options from API:", JSON.stringify(options, null, 2))
        
        if (!options || options.length === 0) {
          console.warn("No shipping options available for this cart")
          setShippingOptions([])
          return
        }
        
        // Calculate prices for calculated shipping options
        const optionsWithPrices = await Promise.all<ShippingOption>(
          options.map(async (option) => {
            if (option.price_type === "calculated") {
              try {
                const calculatedOption = await calculatePriceForShippingOption(
                  option.id,
                  currentCart.id
                )
                
                if (calculatedOption) {
                  return {
                    ...option,
                    amount: calculatedOption.amount
                  }
                }
              } catch (error) {
                console.error('Error calculating shipping price:', error)
              }
            }
            return option as ShippingOption
          })
        )
        
        console.log("✅ Loaded shipping options:", optionsWithPrices.length)
        setShippingOptions(optionsWithPrices)
        
      } catch (error) {
        console.error("Failed to load shipping options", error)
        setShippingOptions([])
      }
    }

    loadShippingOptions()
  }, [currentCart?.id, currentCart?.shipping_address])

  // Handle shipping address changes with proper cart state management
  const handleShippingAddressChange = useCallback(async (event: any) => {
    try {
      console.log("📍 Shipping address changed - event:", event)
      
      if (!event.address) {
        console.error("No shipping address provided in the event")
        throw new Error("Shipping address is required")
      }

      console.log("📍 Updating cart with shipping address...")
      
      // Log the incoming data structure for debugging
      console.log("📦 Incoming address data:", {
        name: event.name,
        address: event.address,
        shippingAddress: event.shippingAddress
      })

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

      console.log("📝 Processed shipping data for cart update:", shippingData)
      
      // Update cart with shipping address using the processed data
      const updatedCart = await updateCart({
        shipping_address: shippingData
      })
      
      // CRITICAL: Wait and retrieve the updated cart to ensure address is saved
      console.log("🔄 Retrieving updated cart state...")
      const freshCart = await retrieveCart(currentCart.id)
      
      if (!freshCart || !freshCart.shipping_address) {
        throw new Error("Failed to update cart with shipping address")
      }
      
      console.log("✅ Cart updated with address:", freshCart.shipping_address)
      setCurrentCart(freshCart)
      
      // Now fetch shipping options for the updated cart
      console.log("🚚 Fetching shipping options for updated cart...")
      const shippingMethods = await listCartShippingMethods(freshCart.id)
        
      if (!shippingMethods || shippingMethods.length === 0) {
        console.warn("No shipping methods available for updated cart")
        // Provide fallback free shipping option
        event.resolve({
          shippingRates: [{
            id: 'free-shipping-fallback',
            displayName: 'Free Shipping',
            amount: 0,
            deliveryEstimate: {
              minimum: { unit: 'business_day' as const, value: 3 },
              maximum: { unit: 'business_day' as const, value: 7 }
            }
          }]
        })
        return
      }
        
      // Calculate prices for shipping options
      const optionsWithPrices = await Promise.all<ShippingOption>(
        shippingMethods.map(async (option) => {
          if (option.price_type === "calculated") {
            try {
              const calculatedOption = await calculatePriceForShippingOption(
                option.id,
                freshCart.id
              )
              
              if (calculatedOption) {
                return {
                  ...option,
                  amount: calculatedOption.amount
                }
              }
            } catch (error) {
              console.error('Error calculating shipping price:', error)
            }
          }
          return option as ShippingOption
        })
      )
    
      setShippingOptions(optionsWithPrices)
      
      // Format shipping rates for Stripe
      const stripeShippingRates = optionsWithPrices.map(option => ({
        id: option.id,
        displayName: option.name || 'Shipping',
        amount: Math.round((option.amount || 0) * 100), // Convert to cents
        deliveryEstimate: {
          minimum: { unit: 'business_day' as const, value: 1 },
          maximum: { unit: 'business_day' as const, value: 5 }
        }
      }))
      
      console.log("📦 Providing shipping rates to Stripe:", stripeShippingRates.length)
      
      // Provide shipping rates to Stripe
      event.resolve({
        shippingRates: stripeShippingRates.length > 0 ? stripeShippingRates : [{
          id: 'free-shipping-fallback',
          displayName: 'Free Shipping',
          amount: 0,
          deliveryEstimate: {
            minimum: { unit: 'business_day' as const, value: 3 },
            maximum: { unit: 'business_day' as const, value: 7 }
          }
        }]
      })
      
    } catch (error) {
      console.error('❌ Error handling shipping address change:', error)
      // Always provide fallback to prevent Stripe errors
      event.resolve({
        shippingRates: [{
          id: 'free-shipping-fallback',
          displayName: 'Free Shipping',
          amount: 0,
          deliveryEstimate: {
            minimum: { unit: 'business_day' as const, value: 3 },
            maximum: { unit: 'business_day' as const, value: 7 }
          }
        }]
      })
    }
  }, [currentCart.id])

  // Handle shipping method selection with improved error handling
  const handleShippingRateChange = useCallback(async (event: any) => {
    try {
      console.log("🚚 Shipping rate changed:", event.shippingRate)
      
      if (event.shippingRate?.id && event.shippingRate.id !== 'free-shipping-fallback') {
        console.log("💾 Storing selected shipping method:", event.shippingRate.id)
        // Store selected shipping method ID for later use in handleExpressCheckout
        // We'll set it during the final checkout confirmation
      }
      
      // Always resolve successfully
      event.resolve({})
    } catch (error) {
      console.error('❌ Error handling shipping rate change:', error)
      event.resolve({})
    }
  }, [])

  // Handle final payment confirmation with proper cart state management
  const handleExpressCheckout = async (event: any) => {
    console.log("💳 Express checkout confirmed", {
      hasShippingAddress: !!event.shippingAddress,
      hasShippingRate: !!event.shippingRate,
      hasBillingDetails: !!event.billingDetails,
      payerEmail: event.payerEmail,
      expressPaymentType: event.expressPaymentType,
      cartHasShippingAddress: !!currentCart.shipping_address,
      cartHasBillingAddress: !!currentCart.billing_address,
    })
    
    if (!stripe || !elements) {
      setError("Stripe not loaded")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let workingCart = currentCart

      // Ensure we have the latest cart state
      console.log("🔄 Retrieving latest cart state...")
      const latestCart = await retrieveCart(currentCart.id)
      if (latestCart) {
        workingCart = latestCart
        setCurrentCart(latestCart)
      }

      // Set shipping method if one was selected and cart is ready
      if (event.shippingRate && event.shippingRate.id !== 'free-shipping-fallback') {
        console.log("🚚 Setting shipping method:", event.shippingRate.id)
        
        try {
          await setShippingMethod({
            cartId: workingCart.id,
            shippingMethodId: event.shippingRate.id
          })
          console.log("✅ Shipping method set successfully")
          
          // Get updated cart after setting shipping method
          const cartWithShipping = await retrieveCart(workingCart.id)
          if (cartWithShipping) {
            workingCart = cartWithShipping
            setCurrentCart(cartWithShipping)
          }
          
        } catch (shippingError: any) {
          console.error("❌ Failed to set shipping method:", shippingError)
          
          // If setting specific shipping method fails, try with first available option
          if (shippingOptions.length > 0) {
            console.log("🔄 Trying with first available shipping option...")
            await setShippingMethod({
              cartId: workingCart.id,
              shippingMethodId: shippingOptions[0].id
            })
          }
        }
      } else if (shippingOptions.length > 0) {
        // Auto-select first shipping option if none was explicitly selected
        console.log("🚚 Auto-selecting first shipping option:", shippingOptions[0].id)
        await setShippingMethod({
          cartId: workingCart.id,
          shippingMethodId: shippingOptions[0].id
        })
      }

      // Create payment session with Stripe
      console.log("💳 Creating payment session...")
      const paymentSessionResponse = await initiatePaymentSession(workingCart, {
        provider_id: "pp_stripe_stripe",
      })

      const paymentSession = paymentSessionResponse?.payment_collection?.payment_sessions?.[0]
      const clientSecret = paymentSession?.data?.client_secret as string

      if (!clientSecret) {
        throw new Error("Failed to create payment session")
      }

      // Place the order to get the order ID
      console.log("📋 Placing order...")
      const orderResult = await placeOrder()
      console.log("✅ Order placed successfully:", orderResult)

      if (!orderResult?.id) {
        throw new Error("Failed to place order or get order ID")
      }

      // Confirm payment with Stripe using the order ID in the return URL
      console.log("💳 Confirming payment with Stripe...")
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${countryCode || 'us'}/order/${orderResult.id}/confirmed`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      // Redirect to confirmation page
      console.log("✅ Payment confirmed, redirecting...")
      window.location.href = `/${countryCode || 'us'}/order/${orderResult.id}/confirmed`
      
    } catch (error: any) {
      console.error("❌ Express checkout failed:", error)
      setError(error.message || "Express checkout failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!currentCart?.id) {
    return null
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
            // Provide initial shipping rates (only if we have a shipping address)
            shippingRates: currentCart.shipping_address ? shippingOptions.map(option => ({
              id: option.id,
              displayName: option.name || 'Shipping',
              amount: Math.round((option.amount || 0) * 100), // Convert to cents
              deliveryEstimate: {
                minimum: { unit: 'business_day' as const, value: 1 },
                maximum: { unit: 'business_day' as const, value: 5 }
              }
            })) : [],
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