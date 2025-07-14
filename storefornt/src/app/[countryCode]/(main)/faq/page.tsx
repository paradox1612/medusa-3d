'use client';

import { useState } from 'react';
import { Heading } from "@medusajs/ui";
import ReactMarkdown from 'react-markdown';
import FAQSection from '@modules/layout/components/FAQSection';

// FAQ data
const faqData = [
  {
    question: "What's your return policy?",
    answer: "We offer a 30-day return policy for most items. Products must be unused and in the same condition that you received them."
  },
  {
    question: "How do I request a refund?",
    answer: "To request a refund, please contact our customer service team through your account dashboard or email us with your order number and reason for the refund."
  },
  {
    question: "How long does the refund process take?",
    answer: "Once we receive your return, it typically takes 3-5 business days to process the refund. The time it takes for the money to appear in your account depends on your payment method and financial institution."
  },
  {
    question: "Do I have to pay for return shipping?",
    answer: "For standard returns, customers are responsible for return shipping costs. If you received a defective or incorrect item, we'll provide a prepaid return label."
  },
  {
    question: "Can I exchange an item instead of returning it?",
    answer: "Yes, we do offer exchanges. Please contact our customer service team to initiate an exchange process."
  }
]

const ShippingReturnPolicy = () => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-8">
          <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
          <span className="text-gray-700 font-medium">Minimica</span>
        </div>

        {/* Main Title */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Shipping &
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Returns
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Everything you need to know about shipping, returns, and refunds for your personalized 3D miniatures.
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Shipping Policy Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Shipping Policy
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <ReactMarkdown
                  components={{
                    ul: ({ children }) => <ul className="space-y-3 ml-4">{children}</ul>,
                    li: ({ children }) => <li className="flex items-start"><span className="w-2 h-2 bg-purple-400 rounded-full mt-3 mr-3 flex-shrink-0"></span><span>{children}</span></li>,
                    p: ({ children }) => <p className="mb-4 text-gray-600">{children}</p>
                  }}
                >
                  {`
We strive to provide fast and reliable shipping for all our customers. Please review our shipping policy below:

- Orders are typically processed within 1-2 business days.
- Shipping times vary depending on the selected method and destination:
  - Standard Shipping: 5-7 business days
- Free shipping is available on orders over $100
- International customers are responsible for any customs fees or taxes.
- We provide tracking information for all shipments via email.
                  `}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Return & Refund Policy Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Return & Refund Policy
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <ReactMarkdown
                  components={{
                    ul: ({ children }) => <ul className="space-y-3 ml-4">{children}</ul>,
                    li: ({ children }) => <li className="flex items-start"><span className="w-2 h-2 bg-purple-400 rounded-full mt-3 mr-3 flex-shrink-0"></span><span>{children}</span></li>,
                    p: ({ children }) => <p className="mb-4 text-gray-600">{children}</p>
                  }}
                >
                  {`
We want you to be completely satisfied with your purchase. If you're not entirely happy, we're here to help. Here's our return and refund policy:

- You have 30 days from the date of delivery to request a return or refund.
- To be eligible for a return or refund, the item must be unused and in the same condition that you received it.
- To initiate a return or refund, please contact our customer service team with your order number and reason for the return.
- Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
- If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 3-5 business days.
- For standard returns, customers are responsible for return shipping costs.
- If you receive a defective or incorrect item, we'll cover the return shipping and send you a replacement at no extra cost.

Please note that some items, such as personalized or hygiene products, may not be eligible for return. Check the product description for specific details.
                  `}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQSection faqData={faqData} />

          {/* Contact Section */}
          <div className="text-center mt-12 bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h3>
            <p className="text-gray-600 mb-4">
              For any questions about our shipping, return, or refund policies, please contact our support team.
            </p>
            <a 
              href="mailto:support@minimica.com" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@minimica.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingReturnPolicy