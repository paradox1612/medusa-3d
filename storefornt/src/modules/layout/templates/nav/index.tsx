import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Trust Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2 text-xs text-gray-700">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Secure & Safe</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Free Shipping Worldwide</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>4.9/5 from 3,200+ couples</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="relative h-16 mx-auto duration-200 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 shadow-sm">
        <nav className="content-container txt-xsmall-plus text-gray-700 flex items-center justify-between w-full h-full text-small-regular max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Left Side - Menu */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          {/* Center - Logo */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-purple-600 transition-colors duration-200 font-bold text-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
              data-testid="nav-store-link"
            >
              ❤️ Minimica
            </LocalizedClientLink>
          </div>

          {/* Right Side - Account & Cart */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-purple-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-purple-50"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
              
              {/* Additional Nav Items */}
              <LocalizedClientLink
                className="hover:text-purple-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-purple-50"
                href="/gallery"
              >
                Gallery
              </LocalizedClientLink>
              
              <LocalizedClientLink
                className="hover:text-purple-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-purple-50"
                href="/how-it-works"
              >
                How It Works
              </LocalizedClientLink>
            </div>
            
            {/* Cart Button with Enhanced Styling */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-purple-600 transition-colors duration-200 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  🛒 Cart (0)
                </LocalizedClientLink>
              }
            >
              <div className="relative">
                <CartButton />
                {/* You might want to wrap CartButton with similar styling */}
              </div>
            </Suspense>
          </div>
        </nav>
      </header>
      
      {/* Subtle gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
    </div>
  )
}