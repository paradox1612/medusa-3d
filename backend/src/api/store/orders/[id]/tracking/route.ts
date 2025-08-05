// src/api/store/orders/[id]/tracking/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query")
  const { id: orderId } = req.params

  // Retrieve the order with its fulfillments and their labels
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "fulfillments.labels.*"
    ],
    filters: { id: orderId },
  })

  const order = orders[0]
  // Collect all tracking numbers from all fulfillments
  const trackingIds = (order.fulfillments || [])
    .flatMap(f => f ? (f.labels || []).map(label => label.tracking_number) : [])

  res.json({ tracking_ids: trackingIds })
}