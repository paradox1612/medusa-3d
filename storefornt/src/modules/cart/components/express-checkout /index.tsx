import { useState, useEffect, useCallback } from "react"
import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, setShippingMethod, listCartOptions, initiatePaymentSession } from "@lib/data/cart"

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
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])

  // Load initial shipping options
  useEffect(() => {
    if (!cart?.id || shippingOptions.length > 0) return

    const loadShippingOptions = async () => {
      try {
        const options = await listCartOptions()
        setShippingOptions(options.shipping_options || [])
      } catch (error) {
        console.error("Failed to load shipping options", error)
        setShippingOptions([])
      }
    }

    loadShippingOptions()
  }, [cart?.id, shippingOptions.length])

  // Handle shipping address changes
  const handleShippingAddressChange = useCallback(async (event: any) => {
    try {
      console.log("Shipping address changed:", event)
      // For express checkout elements, shipping rates are handled automatically
      // Just resolve with success
      event.resolve({ status: 'success' })
    } catch (error) {
      console.error('Error handling shipping address change:', error)
      event.resolve({ status: 'fail' })
    }
  }, [])

  // Handle shipping method selection
  const handleShippingRateChange = useCallback(async (event: any) => {
    try {
      console.log("Shipping rate changed:", event)
      // Resolve the shipping rate change
      event.resolve({ status: 'success' })
    } catch (error) {
      console.error('Error handling shipping rate change:', error)
      event.resolve({ status: 'fail' })
    }
  }, [cart.id])

  // Handle final payment confirmation - shipping is already set by now
  const handleExpressCheckout = async (event: any) => {
    console.log("Express checkout confirmed", {
      hasShippingAddress: !!event.shippingAddress,
      hasShippingRate: !!event.shippingRate,
      hasBillingDetails: !!event.billingDetails,
      payerEmail: event.payerEmail,
      expressPaymentType: event.expressPaymentType,
      cartHasShippingAddress: !!cart.shipping_address,
      cartHasBillingAddress: !!cart.billing_address,
    })
    
    if (!stripe || !elements) {
      setError("Stripe not loaded")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Extract shipping information from the event
      const shippingAddress = event.shippingAddress
      const billingAddress = event.billingAddress || event.shippingAddress
      
      if (shippingAddress) {
        // Update cart with addresses
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
        
        console.log("Updating cart with express checkout addresses")
        await updateCart(addressData)
      }

      // Set shipping method if needed
      if (event.shippingRate) {
        console.log("Setting shipping method:", event.shippingRate.id)
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: event.shippingRate.id
        })
      } else if (shippingOptions.length > 0) {
        console.log("Auto-selecting first shipping option")
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: shippingOptions[0].id
        })
      }

      // Create payment session with Stripe
      console.log("Creating payment session")
      const paymentSessionResponse = await initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })

      const paymentSession = paymentSessionResponse?.payment_collection?.payment_sessions?.[0]
      const clientSecret = paymentSession?.data?.client_secret

      if (!clientSecret) {
        throw new Error("Failed to create payment session")
      }

      // Confirm payment with Stripe
      console.log("Confirming payment with Stripe")
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${countryCode || 'us'}/order/confirmed`,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      console.log("Payment confirmed, placing order")
      
      // Place the order
      const orderResult = await placeOrder()
      console.log("Order placed successfully:", orderResult)
      
    } catch (error: any) {
      console.error("Express checkout failed:", error)
      setError(error.message || "Express checkout failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!cart?.id) {
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
          }}
          onReady={(event) => {
            console.log("ExpressCheckoutElement ready")
            setIsElementReady(true)
          }}
          onLoadError={(event) => {
            console.error("ExpressCheckoutElement load error", event)
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