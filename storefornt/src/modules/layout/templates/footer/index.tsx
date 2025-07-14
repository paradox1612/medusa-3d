import { Text } from "@medusajs/ui"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full bg-gradient-to-br from-emerald-50 via-teal-25 via-yellow-25 to-orange-50">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 lg:flex-row items-start justify-between py-16">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-y-4 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              <img src="/img/logo.png" alt="Minimica Logo" className="h-10 w-auto" />
            </LocalizedClientLink>
            <p className="text-sm text-gray-600 leading-relaxed">
              Create personalized 3D miniatures from your photos. Perfect for couples, families, and anyone looking for a unique bonding experience.
            </p>
          </div>
          
          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            
            {/* Product Links */}
            <div className="flex flex-col gap-y-3">
              <span className="font-semibold text-gray-900">Product</span>
              <ul className="flex flex-col gap-y-2 text-gray-600">
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/how-it-works"
                  >
                    How It Works
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/gallery"
                  >
                    Gallery
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/pricing"
                  >
                    Pricing
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/faq"
                  >
                    FAQ
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="flex flex-col gap-y-3">
              <span className="font-semibold text-gray-900">Support</span>
              <ul className="flex flex-col gap-y-2 text-gray-600">
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/contact"
                  >
                    Contact Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/shipping"
                  >
                    Shipping Info
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/returns"
                  >
                    Returns
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/account"
                  >
                    My Account
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col gap-y-3">
              <span className="font-semibold text-gray-900">Legal</span>
              <ul className="flex flex-col gap-y-2 text-gray-600">
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/privacy"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/terms"
                  >
                    Terms of Service
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-purple-600 transition-colors"
                    href="/refund-policy"
                  >
                    Refund Policy
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row w-full pb-8 justify-between items-center text-gray-500 border-t border-gray-200/50 pt-8">
          <Text className="text-sm">
            © {new Date().getFullYear()} Minimica. All rights reserved.
          </Text>
          
          {/* Trust Badges */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0 text-sm">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}