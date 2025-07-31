import { useState, useEffect, useCallback } from "react"
import { ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { HttpTypes } from "@medusajs/types"
import { updateCart, placeOrder, setShippingMethod, listCartOptions } from "@lib/data/cart"

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

  // Handle shipping address changes - this is where shipping info is captured
  const handleShippingAddressChange = useCallback(async (event: any) => {
    try {
      console.log("Shipping address changed:", event.shippingAddress)
      
      // Extract and format shipping address from the wallet
      const shippingAddress = event.shippingAddress
      const addressData = {
        shipping_address: {
          first_name: shippingAddress.name?.split(' ')[0] || 'Customer',
          last_name: shippingAddress.name?.split(' ').slice(1).join(' ') || '',
          address_1: shippingAddress.addressLine?.[0] || '',
          address_2: shippingAddress.addressLine?.[1] || '',
          city: shippingAddress.city || '',
          country_code: shippingAddress.country?.toLowerCase() || '',
          postal_code: shippingAddress.postalCode || '',
          province: shippingAddress.region || '',
          phone: shippingAddress.phone || '',
        },
        billing_address: {
          first_name: shippingAddress.name?.split(' ')[0] || 'Customer',
          last_name: shippingAddress.name?.split(' ').slice(1).join(' ') || '',
          address_1: shippingAddress.addressLine?.[0] || '',
          address_2: shippingAddress.addressLine?.[1] || '',
          city: shippingAddress.city || '',
          country_code: shippingAddress.country?.toLowerCase() || '',
          postal_code: shippingAddress.postalCode || '',
          province: shippingAddress.region || '',
          phone: shippingAddress.phone || '',
        }
      }

      // Update cart with new address
      await updateCart(addressData)

      // Get updated shipping options for this address
      const options = await listCartOptions()
      const availableOptions = options.shipping_options || []
      setShippingOptions(availableOptions)

      // Format shipping options for Express Checkout
      const expressShippingOptions = availableOptions.map(option => ({
        id: option.id,
        label: option.name,
        amount: Math.round(option.amount || 0), // Stripe expects amount in cents
        detail: option.name
      }))

      // CRITICAL: Must call updateWith to continue the flow
      event.updateWith({
        status: 'success',
        shippingOptions: expressShippingOptions
      })

    } catch (error) {
      console.error('Error handling shipping address change:', error)
      event.updateWith({ status: 'error' })
    }
  }, [])

  // Handle shipping method selection
  const handleShippingRateChange = useCallback(async (event: any) => {
    try {
      console.log("Shipping rate changed:", event.shippingRate)
      
      // Set the selected shipping method in your cart
      await setShippingMethod({
        cartId: cart.id,
        shippingMethodId: event.shippingRate.id
      })

      // CRITICAL: Must call updateWith to continue
      event.updateWith({ status: 'success' })

    } catch (error) {
      console.error('Error handling shipping rate change:', error)
      event.updateWith({ status: 'error' })
    }
  }, [cart.id])

  // Handle final payment confirmation - shipping is already set by now
  const handleExpressCheckout = async (event: any) => {
    console.log("Express checkout confirmed")
    
    if (!stripe || !elements) {
      event.complete('fail')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // At this point, shipping address and method should already be set
      // Just place the order
      const orderResult = await placeOrder()
      console.log("Order placed successfully:", orderResult)
      
      // Complete the express checkout flow
      event.complete('success')
      
    } catch (error: any) {
      console.error("Failed to place order:", error)
      setError(error.message || "Order placement failed")
      event.complete('fail')
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
            // CRITICAL: Enable shipping collection
            business: {
              name: "Your Store Name"
            },
            // This enables shipping address collection
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