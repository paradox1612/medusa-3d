"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import Cart3DModelPreview from "@modules/cart/components/3d-model-preview"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("Cart item product data:", item)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  // Check if this item has 3D model metadata
  const has3DModel = item.metadata?.has_3d_model
  const modelUrl = item.metadata?.model_url as string
  const generatedAt = item.metadata?.generated_at as string
  const predictionId = item.metadata?.prediction_id as string
  
  // Parse uploaded image URLs (no longer base64)
  let uploadedImageUrls: string[] = []
  try {
    if (item.metadata?.uploaded_image_urls && typeof item.metadata.uploaded_image_urls === 'string') {
      uploadedImageUrls = JSON.parse(item.metadata.uploaded_image_urls)
    }
  } catch (error) {
    console.warn("Failed to parse uploaded image URLs:", error)
  }

  // Parse model info
  let modelInfo: Record<string, any> = {}
  try {
    if (item.metadata?.model_info && typeof item.metadata.model_info === 'string') {
      modelInfo = JSON.parse(item.metadata.model_info)
    }
  } catch (error) {
    console.warn("Failed to parse model info:", error)
  }
  
  // Debug: Log the 3D model metadata
  if (has3DModel) {
    console.log("🎭 Cart item with 3D model:", {
      productTitle: item.product_title,
      modelUrl,
      predictionId,
      imageUrls: uploadedImageUrls,
      modelInfo
    })
  }

  // Use first uploaded image as thumbnail if available
  const displayThumbnail = (has3DModel && uploadedImageUrls[0]) 
    ? uploadedImageUrls[0] 
    : item.thumbnail

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={displayThumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        
        {/* 3D Model Information */}
        {has3DModel && (
          <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎭</span>
                <span className="font-semibold text-blue-800">3D Model Included</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Custom Generated
              </span>
            </div>
            
            <div className="space-y-2">
              {modelUrl && (
                <div className="flex gap-2">
                  <Cart3DModelPreview
                    modelUrl={modelUrl}
                    productTitle={item.product_title || ''}
                    generatedAt={generatedAt}
                    predictionId={predictionId}
                    apiResponse={modelInfo}
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = modelUrl
                      link.download = `3d-model-${item.product_title?.replace(/\s+/g, '-')}.glb`
                      link.click()
                    }}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                  >
                    💾 Download
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-blue-600">
                {generatedAt && (
                  <span>Generated: {new Date(generatedAt).toLocaleDateString()}</span>
                )}
                <span className="text-green-600 font-medium">✨ Personalized</span>
              </div>
            </div>
          </div>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
