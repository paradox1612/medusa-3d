"use client"

import { HttpTypes } from "@medusajs/types"
import { Text, Badge } from "@medusajs/ui"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  CreditCard,
  MapPin
} from "lucide-react"
import { getOrderTrackingIds } from "@lib/data/orders"
import { useEffect, useState } from "react"

type OrderTrackingProps = {
  order: HttpTypes.StoreOrder
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const [trackingIds, setTrackingIds] = useState<string[]>([])
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  console.log("=== FULL ORDER DATA ===", order)
  console.log("=== FULFILLMENTS ===", order.fulfillments)
  console.log("=== SHIPPING METHODS ===", order.shipping_methods)
  console.log("=== ITEMS DETAILS ===", order.items?.map(item => item.detail))
  console.log("=== ORDER STATUS ===", {
    status: order.status,
    fulfillment_status: order.fulfillment_status,
    payment_status: order.payment_status
  })

  // Test your custom tracking API
  useEffect(() => {
    const fetchTrackingIds = async () => {
      console.log("=== TESTING CUSTOM TRACKING API ===")
      console.log("Order ID:", order.id)
      
      setTrackingLoading(true)
      setTrackingError(null)
      
      try {
        const ids = await getOrderTrackingIds(order.id)
        console.log("=== TRACKING API SUCCESS ===", ids)
        setTrackingIds(ids || [])
      } catch (error) {
        console.error("=== TRACKING API ERROR ===", error)
        setTrackingError(error instanceof Error ? error.message : 'Failed to fetch tracking')
      } finally {
        setTrackingLoading(false)
      }
    }

    fetchTrackingIds()
  }, [order.id])
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "captured":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
      case "not_fulfilled":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />
      case "fulfilled":
        return <Package className="w-5 h-5 text-purple-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "captured":
        return "green"
      case "pending":
      case "not_fulfilled":
        return "orange"
      case "shipped":
        return "blue"
      case "fulfilled":
        return "green"
      default:
        return "red"
    }
  }

  const getTrackingProgress = () => {
    const { payment_status, fulfillment_status } = order
    
    // Handle delivered status (100%)
    if (fulfillment_status === "delivered") {
      return 100
    }
    // Handle fulfilled status (100%) - some systems use "fulfilled" for delivered
    else if (payment_status === "captured" && fulfillment_status === "fulfilled") {
      return 100
    }
    // Handle shipped status (80%)
    else if (payment_status === "captured" && fulfillment_status === "shipped") {
      return 80
    }
    // Handle processing/preparing status (60%)
    else if (payment_status === "captured" && fulfillment_status === "not_fulfilled") {
      return 60
    }
    // Handle payment confirmed (40%)
    else if (payment_status === "captured") {
      return 40
    }
    // Handle pending payment (20%)
    else if (payment_status === "pending" || payment_status === "awaiting") {
      return 20
    }
    // Order placed (10%)
    return 10
  }

  const getTrackingSteps = () => {
    const steps = [
      {
        title: "Order Placed",
        description: "Your order has been received",
        status: "completed",
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        title: "Payment Confirmed", 
        description: "Payment has been processed",
        status: order.payment_status === "captured" ? "completed" : "pending",
        icon: <CreditCard className="w-4 h-4" />
      },
      {
        title: "Preparing Order",
        description: "Your items are being prepared",
        status: order.fulfillment_status === "not_fulfilled" && order.payment_status === "captured" ? "active" : 
               order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped" || order.fulfillment_status === "delivered" ? "completed" : "pending",
        icon: <Package className="w-4 h-4" />
      },
      {
        title: "Shipped",
        description: "Your order is on its way",
        status: order.fulfillment_status === "shipped" ? "active" : 
               order.fulfillment_status === "delivered" ? "completed" :
               order.fulfillment_status === "fulfilled" ? "completed" : "pending",
        icon: <Truck className="w-4 h-4" />
      },
      {
        title: "Delivered",
        description: "Order delivered successfully",
        status: order.fulfillment_status === "delivered" ? "completed" :
               order.fulfillment_status === "fulfilled" ? "completed" : "pending",
        icon: <MapPin className="w-4 h-4" />
      }
    ]
    
    return steps
  }

  const trackingSteps = getTrackingSteps()
  const progress = getTrackingProgress()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <Text className="text-xl font-semibold">Order Tracking</Text>
        <div className="flex gap-2">
          <Badge color={getStatusColor(order.payment_status)} className="flex items-center gap-1">
            {getStatusIcon(order.payment_status)}
            Payment: {formatStatus(order.payment_status)}
          </Badge>
          <Badge color={getStatusColor(order.fulfillment_status)} className="flex items-center gap-1">
            {getStatusIcon(order.fulfillment_status)}
            Order: {formatStatus(order.fulfillment_status)}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Text className="text-sm font-medium">Progress</Text>
          <Text className="text-sm text-gray-600">{progress}%</Text>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Horizontal Stepper */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700 ease-in-out"
            style={{ width: `${(trackingSteps.filter(step => step.status === "completed").length / trackingSteps.length) * 100}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between items-start relative">
          {trackingSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative z-10 flex-1">
              {/* Step Circle */}
              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                step.status === "completed" 
                  ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200" 
                  : step.status === "active"
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse"
                  : "bg-white border-gray-300 text-gray-400"
              }`}>
                {step.status === "completed" ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <div className="w-8 h-8">
                    {step.icon}
                  </div>
                )}
              </div>
              
              {/* Step Content */}
              <div className="mt-4 text-center max-w-32">
                <Text className={`font-semibold text-sm ${
                  step.status === "completed" 
                    ? "text-green-700" 
                    : step.status === "active"
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}>
                  {step.title}
                </Text>
                <Text className="text-xs text-gray-600 mt-1 leading-tight">
                  {step.description}
                </Text>
                
                {/* Status Badge */}
                {step.status === "completed" && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Complete
                    </span>
                  </div>
                )}
                {step.status === "active" && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      • Active
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.shipping_address && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Text className="font-medium mb-2">Shipping To:</Text>
          <div className="text-sm text-gray-600">
            <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
            <p>{order.shipping_address.address_1}</p>
            {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
            {order.shipping_address.country_code && <p>{order.shipping_address.country_code.toUpperCase()}</p>}
          </div>
        </div>
      )}

      {/* Tracking Numbers Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Text className="font-medium mb-2">Tracking Information</Text>
        {trackingLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Loading tracking information...
          </div>
        )}
        {trackingError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Error: {trackingError}
          </div>
        )}
        {!trackingLoading && !trackingError && trackingIds.length > 0 && (
          <div className="space-y-3">
            {trackingIds.map((trackingId, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <Text className="text-sm font-medium text-gray-900">
                      Tracking Number
                    </Text>
                    <Text className="font-mono text-sm text-gray-700 bg-white px-2 py-1 rounded border mt-1">
                      {trackingId}
                    </Text>
                  </div>
                </div>
                <a
                  href={`https://parcelsapp.com/en/tracking/${trackingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Package className="w-4 h-4" />
                  Track Package
                </a>
              </div>
            ))}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-xs text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Tracking powered by{" "}
                <a 
                  href="https://parcelsapp.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ParcelsApp
                </a>
                {" "}• Real-time updates from 600+ carriers worldwide
              </Text>
            </div>
          </div>
        )}
        {!trackingLoading && !trackingError && trackingIds.length === 0 && (
          <div className="text-sm text-gray-500">
            No tracking information available yet.
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Text className="font-medium">Order Date</Text>
            <Text className="text-gray-600">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </div>
          <div>
            <Text className="font-medium">Order Number</Text>
            <Text className="text-gray-600">#{order.display_id}</Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking