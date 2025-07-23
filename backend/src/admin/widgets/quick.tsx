import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { useState } from "react"

const Product3DToggleWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const is3D = product.metadata?.needs_3d_product === "true" || product.metadata?.needs_3d_product=== true

  const [checked, setChecked] = useState(is3D)

  const { mutate, isPending } = useMutation({
    mutationFn: (newValue: boolean) =>
      sdk.admin.product.update(product.id, {
        metadata: {
          ...product.metadata,
          needs_3d_product: newValue,
        },
      }),
    onSuccess: () => {
      toast.success("3D status updated")
      queryClient.invalidateQueries({ queryKey: [["product", product.id]] })
    },
    onError: () => {
      toast.error("Failed to update 3D status")
    },
  })

  const handleToggle = () => {
    setChecked((prev) => {
      const newValue = !prev
      mutate(newValue)
      return newValue
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">3D Product Model</Heading>
        <div className="flex items-center gap-4 px-6 py-4">
        <Switch checked={checked} onCheckedChange={handleToggle} disabled={isPending} />
      </div>
      </div>
   
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default Product3DToggleWidget