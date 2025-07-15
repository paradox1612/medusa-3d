import { Container } from "@medusajs/ui"
import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Text } from "@medusajs/ui"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Refund Policy | Medusa 3D Store",
  description: "Our refund and return policy for custom 3D printed models.",
}

export default async function RefundPolicy() {
  const sortBy = "created_at"
  const { collections } = await listCollections()
  const regions = await listRegions()

  return (
    <div className="flex flex-col small:py-12 py-6">
      <div className="content-container flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl-semi mb-8">Refund & Return Policy</h1>
          
          <div className="mb-8">
            <h2 className="text-xl-semi mb-4">Our Policy on Returns</h2>
            <p className="mb-4">
              Due to the custom nature of our 3D printed models, we do not accept returns or offer refunds for items that have been painted or colored. Each model is made to your specific requirements, making returns impractical.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl-semi mb-4">Damaged or Defective Items</h2>
            <p className="mb-4">
              We understand that accidents happen during shipping. If your package arrives with damaged or broken items, please contact us within 2 days of receiving your order. We will work with you to replace the damaged items at no additional cost.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl-semi mb-4">Contact Us</h2>
            <p>
              If you have any questions about our refund policy or need to report a damaged item, please don't hesitate to <Link href="/contact" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline">contact us</Link>. Our customer service team is here to help resolve any issues you may have with your order.
            </p>
          </div>

          <div className="text-sm text-gray-500 mt-12">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
