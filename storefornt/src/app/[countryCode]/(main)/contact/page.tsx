import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Contact Us | Minimica",
  description: "Get in touch with Minimica. We're here to help with any questions about our 3D printed miniatures and custom orders.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://minimica.com"),
  openGraph: {
    title: "Contact Us | Minimica",
    description: "Reach out to our team for any questions about our 3D printed miniatures and custom orders.",
  },
}

export default function ContactPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We'd love to hear from you! Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Email Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Us</h3>
          <p className="text-gray-600 mb-4">We'll get back to you within 24 hours</p>
          <LocalizedClientLink 
            href="mailto:customer@minimica.com" 
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
          >
            customer@minimica.com
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </LocalizedClientLink>
        </div>

        {/* Social Media Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 18h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media</h3>
          <p className="text-gray-600 mb-4">Connect with us on social media</p>
          <div className="flex space-x-4">
            <a 
              href="https://www.instagram.com/minimica" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700"
              aria-label="Instagram"
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@minimica" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700"
              aria-label="TikTok"
            >
              <span className="sr-only">TikTok</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.52 2.92a6.98 6.98 0 00-2.46.01 4.13 4.13 0 01-1.5-3.12v13.05c0 1.45-1.18 2.63-2.63 2.63s-2.63-1.18-2.63-2.63 1.18-2.63 2.63-2.63c.28 0 .55.04.81.1v-3.26a6.97 6.97 0 00-2.45-.45c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7V6.42a8.99 8.99 0 003.5-1.5v5.1a4.13 4.13 0 01-1.5-3.12c0-2.28 1.85-4.13 4.13-4.13s4.13 1.85 4.13 4.13-1.85 4.13-4.13 4.13c-.28 0-.55-.04-.81-.1v-3.26c.92.25 1.9.1 2.75-.4.84-.5 1.4-1.33 1.5-2.28.1-.95-.2-1.9-.8-2.6-.6-.7-1.45-1.1-2.35-1.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
            <p className="mt-1 text-gray-600">
              Click the chat icon in the bottom right corner of your screen to chat with our team in real-time.
              We're available Monday to Friday, 9:00 AM to 6:00 PM CST.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 mb-6">
          Check out our <LocalizedClientLink href="/faq" className="text-purple-600 hover:underline">FAQ page</LocalizedClientLink> for answers to common questions about our products, shipping, and more.
        </p>
      </div>
    </div>
  )
}
