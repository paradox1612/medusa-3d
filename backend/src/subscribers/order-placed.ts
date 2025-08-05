import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve("query")

  try {
    // Fetch comprehensive order data
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "*",
        "items.*",
        "customer.*",
        "shipping_address.*",
        "billing_address.*",
        "summary.*",
        "shipping_methods.*",
        "transactions.*"
      ],
      filters: { id: data.id },
    })

    if (!order) {
      console.error(`Order not found: ${data.id}`)
      return
    }

    // Log the complete order structure to understand the data
    console.log("=== COMPLETE ORDER STRUCTURE ===")
    console.log(JSON.stringify(order, null, 2))
    console.log("=== ORDER KEYS ===")
    console.log(Object.keys(order))
    if (order.items) {
      console.log("=== ITEMS STRUCTURE ===")
      console.log(JSON.stringify(order.items, null, 2))
    }
    if (order.summary) {
      console.log("=== SUMMARY STRUCTURE ===")
      console.log(JSON.stringify(order.summary, null, 2))
    }
    if (order.shipping_methods) {
      console.log("=== SHIPPING METHODS STRUCTURE ===")
      console.log(JSON.stringify(order.shipping_methods, null, 2))
    }

    // Format currency helper function (values are already in dollars)
    const formatCurrency = (amount: number, currencyCode: string): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
      }).format(amount)
    }

    // Safely access properties with proper null checks FIRST
    const orderDisplayId = (order as any).display_id || 'N/A';
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const shippingMethods = Array.isArray(order.shipping_methods) ? order.shipping_methods : [];

    // Now calculate breakdown from available data (after variables are declared)
    const itemsSubtotal = orderItems.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0);
    const shippingTotal = shippingMethods.reduce((sum: number, method: any) => 
      sum + (method.amount || 0), 0);
    const taxTotal = (order.summary?.current_order_total || 0) - itemsSubtotal - shippingTotal;

    // Prepare data for SendGrid template
    const templateData = {
      order: {
        ...order,
        display_id: orderDisplayId,
        
        // Add calculated totals for template
        calculated_subtotal: itemsSubtotal,
        calculated_shipping: shippingTotal,
        calculated_tax: taxTotal > 0 ? taxTotal : 0,
        
        // Format item prices
        items: orderItems.map((item: any) => ({
          ...item,
          formatted_unit_price: formatCurrency(item.unit_price || 0, order.currency_code),
          formatted_total_price: formatCurrency((item.unit_price || 0) * (item.quantity || 1), order.currency_code),
        })),

        // Format summary amounts 
        summary: {
          ...order.summary,
          formatted_current_total: formatCurrency(order.summary?.current_order_total || 0, order.currency_code),
          formatted_paid_total: formatCurrency(order.summary?.paid_total || 0, order.currency_code),
          formatted_subtotal: formatCurrency(itemsSubtotal, order.currency_code),
          formatted_shipping: formatCurrency(shippingTotal, order.currency_code),
          formatted_tax: formatCurrency(taxTotal > 0 ? taxTotal : 0, order.currency_code),
        },

        // Format shipping methods
        shipping_methods: shippingMethods.map((method: any) => ({
          ...method,
          formatted_amount: formatCurrency(method.amount || 0, order.currency_code),
        })),
      },
      
      // Additional template variables
      company_name: process.env.COMPANY_NAME || "Your Store",
      support_email: process.env.SUPPORT_EMAIL || "support@yourstore.com",
      support_phone: process.env.SUPPORT_PHONE || "",
      tracking_url: process.env.TRACKING_URL 
        ? `${process.env.TRACKING_URL}?order=${orderDisplayId}` 
        : "#",
      current_year: new Date().getFullYear(),
      
      // Helper for currency formatting in template
      format_currency: (amount: number, currencyCode: string) => 
        formatCurrency(amount, currencyCode),
    }

    // Send notification
    await notificationModuleService.createNotifications({
      to: order.email as string,
      channel: "email",
      template: process.env.SENDGRID_ORDER_TEMPLATE_ID || "your-sendgrid-template-id",
      data: templateData,
    })

    console.log(`Order confirmation email sent for order ${orderDisplayId}`)
    
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
    // Optionally, you might want to throw the error to retry the event
    // throw error
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}