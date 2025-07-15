"use client"

import { addToCart, addToCartWith3D } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [generated3DModel, setGenerated3DModel] = useState<any | null>(null)
  const [is3DGenerating, setIs3DGenerating] = useState(false)
  const countryCode = useParams().countryCode as string

  // Check if this product needs 3D functionality
  const needs3D = product.metadata?.needs_3d_product === "true" || product.metadata?.needs_3d_product === true

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      if (generated3DModel) {
        console.log("🛒 Adding to cart with 3D model:", {
          variantId: selectedVariant.id,
          modelData: generated3DModel,
          countryCode
        })
        
        console.log("🔍 Verifying 3D model data before adding to cart:", {
          hasModelData: !!generated3DModel,
          modelUrl: generated3DModel?.model_url,
          predictionId: generated3DModel?.prediction_id,
          dataKeys: Object.keys(generated3DModel || {}),
          fullData: generated3DModel
        })
        
        // Add to cart with 3D model metadata
        await addToCartWith3D({
          variantId: selectedVariant.id,
          quantity: 1,
          countryCode,
          modelData: generated3DModel,
        })
        
        console.log("✅ Successfully added to cart with 3D model")
      } else {
        console.log("🛒 Adding to cart without 3D model")
        
        // Regular add to cart
        await addToCart({
          variantId: selectedVariant.id,
          quantity: 1,
          countryCode,
        })
        
        console.log("✅ Successfully added to cart")
      }
    } catch (error) {
      console.error("❌ Failed to add to cart:", error)
    }

    setIsAdding(false)
  }

  // Listen for 3D model events from Product3DSection via custom events
  useEffect(() => {
    const handleModelGenerated = (event: CustomEvent) => {
      console.log("🎭 ProductActions received 3D model data")
      setGenerated3DModel(event.detail)
      setIs3DGenerating(false)
    }

    const handleModelGenerationStarted = () => {
      console.log("🔄 ProductActions: 3D model generation started")
      setIs3DGenerating(true)
    }

    const handleModelGenerationError = () => {
      console.log("❌ ProductActions: 3D model generation failed")
      setIs3DGenerating(false)
    }

    // Listen for custom events from Product3DSection
    window.addEventListener('3d-model-generated', handleModelGenerated as EventListener)
    window.addEventListener('3d-model-generation-started', handleModelGenerationStarted)
    window.addEventListener('3d-model-generation-error', handleModelGenerationError)

    return () => {
      window.removeEventListener('3d-model-generated', handleModelGenerated as EventListener)
      window.removeEventListener('3d-model-generation-started', handleModelGenerationStarted)
      window.removeEventListener('3d-model-generation-error', handleModelGenerationError)
    }
  }, [])

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {/* 3D Model Status - Only for 3D products */}
        {needs3D && (
          <div className="space-y-4">
            {is3DGenerating && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="font-medium text-yellow-800">Generating 3D Model...</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Please wait while we create your personalized 3D model
                </p>
              </div>
            )}

            {!generated3DModel && !is3DGenerating && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎭</span>
                  <span className="font-medium text-blue-800">3D Customizable Product</span>
                </div>
                <p className="text-sm text-blue-700">
                  Use the 3D gallery above to create your personalized model
                </p>
              </div>
            )}

            {generated3DModel && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium text-green-800">3D Model Ready!</span>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Your custom 3D model has been generated and will be included with this product.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(generated3DModel.model_url, '_blank')}
                    variant="secondary"
                    className="text-xs"
                    size="small"
                  >
                    Preview 3D Model
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            (needs3D && !generated3DModel) || // Disable for 3D products without model
            is3DGenerating // Disable while 3D is generating
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding || is3DGenerating}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "Select variant"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : is3DGenerating
            ? "Generating 3D Model..."
            : needs3D && !generated3DModel
            ? "Create 3D Model First"
            : generated3DModel
            ? "Add to cart with 3D Model"
            : "Add to cart"}
        </Button>
        {/* Mobile Actions */}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding || is3DGenerating}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || is3DGenerating}
        />
      </div>
    </>
  )
}
