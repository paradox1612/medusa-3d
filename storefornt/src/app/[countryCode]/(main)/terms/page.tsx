import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Minimica',
  description: 'Minimica Terms of Service - AI-powered 3D model generation and printing',
  robots: {
    index: false,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: August 2, 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Hastkari LLC, operating as Minimica ("Company," "we," "us," or "our") governing your access to and use of our website, services, and AI-powered 3D model generation platform (collectively, the "Services").
              </p>
              <p className="mb-4">
                BY ACCESSING OR USING OUR SERVICES, CREATING AN ACCOUNT, OR PLACING AN ORDER, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND ALL APPLICABLE LAWS AND REGULATIONS. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE OUR SERVICES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility and Capacity</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Age Requirements</h3>
                <p className="mb-4">
                  You must be at least 18 years of age to use our Services. If you are under 18, you may only use our Services with the direct involvement and express consent of a parent or legal guardian who agrees to be bound by these Terms.
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Legal Capacity</h3>
                <p className="mb-2">By using our Services, you represent and warrant that:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>You have the legal capacity to enter into this agreement</li>
                  <li>You are not prohibited from using our Services under applicable law</li>
                  <li>All information you provide is accurate and complete</li>
                  <li>You will maintain the accuracy of such information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Description of Services</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">AI-Powered 3D Model Generation</h3>
                <p className="mb-4">
                  Minimica provides AI-powered services that convert user-uploaded 2D images into custom 3D models using machine learning algorithms, including but not limited to open-source models such as Hunyuan 2.0. These 3D models are then manufactured and shipped to customers along with painting supplies.
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Service Limitations</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Our AI technology provides best-effort results but cannot guarantee perfect accuracy or quality</li>
                  <li>Model generation depends on image quality, clarity, and suitability for 3D conversion</li>
                  <li>We reserve the right to reject orders that cannot be reasonably processed</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User-Generated Content & License</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Your Content Rights</h3>
                <p className="mb-4">
                  You retain all ownership rights in and to the images and content you upload ("User Content"). By uploading User Content, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>You own all rights to the User Content or have obtained all necessary permissions</li>
                  <li>Your User Content does not infringe any third-party intellectual property rights</li>
                  <li>You have the right to grant the licenses set forth herein</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Limited License Grant</h3>
                <p className="mb-2">By uploading User Content, you grant us a limited, worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Use, reproduce, process, and store your User Content solely for the purpose of providing our Services</li>
                  <li>Generate 3D models based on your User Content</li>
                  <li>Fulfill your orders and provide customer support</li>
                  <li>Improve our AI algorithms and Services (using anonymized data only)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Prohibited Content and Conduct</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Prohibited Content</h3>
                <p className="mb-2">You may not upload User Content that:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Contains nudity, sexual content, or sexually suggestive material</li>
                  <li>Depicts minors in any inappropriate or exploitative manner</li>
                  <li>Violates intellectual property rights of any third party</li>
                  <li>Contains hate speech, violence, threats, or promotes illegal activities</li>
                  <li>Includes copyrighted characters, logos, trademarks, or branded content without proper authorization</li>
                  <li>Is defamatory, libelous, or invasive of privacy</li>
                  <li>Is of insufficient quality that would result in an unsatisfactory 3D model</li>
                </ul>
              </div>
              <p className="mb-4">
                We reserve the right to reject any order that violates these guidelines and issue a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Orders, Pricing, and Payment</h2>
              <p className="mb-4">
                All orders are subject to our acceptance. Pricing is displayed in your local currency and includes applicable taxes. Payment is processed securely through our payment partners. Orders cannot be cancelled once 3D model generation has begun (typically within 24 hours of order placement).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Shipping & Delivery</h2>
              <p className="mb-4">
                Processing time is typically 7-14 business days from order confirmation. Shipping times vary by location. We are not responsible for delays caused by customs, weather, or carrier issues. Risk of loss transfers to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Product Safety and Health Warnings</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-semibold">
                      IMPORTANT SAFETY WARNING
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Resin 3D Printing Hazards</h3>
                <p className="mb-4">
                  Our products are manufactured using photopolymer resin 3D printing technology. <strong>Finished products may contain trace amounts of uncured resin and require proper handling.</strong>
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ HEALTH AND SAFETY WARNINGS:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-red-700">
                    <li><strong>Skin Contact:</strong> May cause skin irritation, allergic reactions, or dermatitis. Wash hands thoroughly after handling.</li>
                    <li><strong>Eye Contact:</strong> May cause serious eye irritation. Avoid touching eyes after handling products.</li>
                    <li><strong>Inhalation:</strong> Avoid prolonged inhalation of any odors from the product.</li>
                    <li><strong>Ingestion:</strong> Products are NOT food-safe and should never be placed in mouth or used with food.</li>
                    <li><strong>Pregnancy/Nursing:</strong> Pregnant or nursing women should use extra caution and consult healthcare providers.</li>
                    <li><strong>Children:</strong> Keep away from children under 14. Adult supervision required for ages 14-17.</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🧤 RECOMMENDED SAFETY MEASURES:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-blue-700">
                    <li>Wear gloves when handling the product, especially during painting</li>
                    <li>Use in well-ventilated areas</li>
                    <li>Wash hands thoroughly with soap and water after handling</li>
                    <li>Do not eat, drink, or smoke while handling the product</li>
                    <li>Store in a cool, dry place away from direct sunlight</li>
                    <li>If skin irritation occurs, discontinue use and consult a healthcare provider</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Material Composition</h3>
                <p className="mb-4">
                  Our 3D printed models are made from photopolymer resins that may include:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Acrylate oligomers and monomers</li>
                  <li>Photoinitiators and UV stabilizers</li>
                  <li>Pigments and dyes</li>
                  <li>Other proprietary additives</li>
                </ul>
                <p className="mb-4">
                  <strong>Note:</strong> While we thoroughly wash and cure all products, complete removal of all uncured resin cannot be guaranteed.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Returns & Refunds</h2>
              <p className="mb-4">
                Due to the custom nature of our products, returns are only accepted for defective items or shipping damage. Claims must be made within 14 days of delivery with photographic evidence. Refunds will be processed to the original payment method within 5-10 business days.
              </p>
              <p className="mb-4">
                <strong>Important:</strong> Products cannot be returned due to skin sensitivities, allergic reactions, or other health-related issues, as these vary by individual. Please review all safety warnings before use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
              <p className="mb-4">
                Minimica and all related trademarks, logos, and content are owned by Hastkari LLC or our licensors. The AI-generated 3D models are derivative works based on your uploaded content, and you retain rights to the underlying image while we retain rights to our AI processes and methodologies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Disclaimers and Limitations</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Product Disclaimers</h3>
                <p className="mb-4">
                  YOU ACKNOWLEDGE AND AGREE THAT:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>3D resin printed products may cause allergic reactions or skin sensitivities in some individuals</li>
                  <li>You use our products at your own risk and have read all safety warnings</li>
                  <li>We cannot guarantee products are completely free of uncured resin or allergens</li>
                  <li>Products are for decorative purposes only and are not food-safe or toy-safe</li>
                  <li>Color variations may occur due to the 3D printing and curing process</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Health and Safety Disclaimer</h3>
                <p className="mb-4">
                  WE STRONGLY RECOMMEND CONSULTING WITH A HEALTHCARE PROVIDER BEFORE USE IF YOU HAVE:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Known allergies to acrylates, methacrylates, or photopolymers</li>
                  <li>Sensitive skin or history of contact dermatitis</li>
                  <li>Respiratory conditions or chemical sensitivities</li>
                  <li>Pregnancy or nursing status</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HASTKARI LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF OUR SERVICES.
              </p>
              <p className="mb-4">
                <strong>HEALTH-RELATED DISCLAIMER:</strong> WE SHALL NOT BE LIABLE FOR ANY HEALTH-RELATED ISSUES, ALLERGIC REACTIONS, SKIN SENSITIVITIES, OR OTHER ADVERSE EFFECTS RESULTING FROM USE OF OUR RESIN-PRINTED PRODUCTS. YOU ASSUME ALL RISKS ASSOCIATED WITH HANDLING AND USE OF OUR PRODUCTS.
              </p>
              <p className="mb-4">
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SPECIFIC PRODUCT OR SERVICE GIVING RISE TO THE CLAIM DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Dispute Resolution</h2>
              <p className="mb-4">
                These Terms are governed by and construed in accordance with the laws of the State of Texas, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Texas, and you consent to the jurisdiction of such courts.
              </p>
              <p className="mb-4">
                Any dispute, claim, or controversy arising out of or relating to these Terms or our Services shall be settled by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
              </p>
              <p className="mb-4 font-semibold">
                YOU AGREE THAT ANY ARBITRATION OR LEGAL PROCEEDING SHALL BE LIMITED TO THE DISPUTE BETWEEN YOU AND US INDIVIDUALLY. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="mb-4">
                We may update these Terms from time to time. We will notify users of material changes via email or prominent notice on our website. Continued use of our Services after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> customer@minimica.com</p>
                <p className="mb-2"><strong>Company:</strong> Hastkari LLC (operating as Minimica)</p>
                <p><strong>Jurisdiction:</strong> State of Texas, USA</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}