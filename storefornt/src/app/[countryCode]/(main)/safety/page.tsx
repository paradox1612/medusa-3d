import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Data Sheet - Minimica',
  description: 'Important safety information for Minimica 3D printed products',
  robots: {
    index: true,
    follow: true,
  },
}

export default function SafetyDataSheet() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Product Safety Data Sheet
          </h1>
          <p className="text-lg text-gray-600">
            Important safety information for Minimica 3D printed products
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: August 2, 2025 | Version 1.0
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            {/* Emergency Alert */}
            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">
                    Emergency Contact Information
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p><strong>For medical emergencies:</strong> Call 911 (US) or your local emergency number</p>
                    <p><strong>Poison Control:</strong> 1-800-222-1222 (US)</p>
                    <p><strong>Company Emergency:</strong> customer@minimica.com</p>
                  </div>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Product Identification</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p><strong>Product Name:</strong> Custom 3D Printed Models</p>
                <p><strong>Manufacturer:</strong> Hastkari LLC (operating as Minimica)</p>
                <p><strong>Product Type:</strong> Photopolymer resin printed decorative items</p>
                <p><strong>Intended Use:</strong> Decorative display purposes only</p>
                <p><strong>Restrictions:</strong> Not for food contact, not a toy, keep away from children under 14</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Hazard Identification</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Primary Hazards</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Skin sensitization</li>
                    <li>• Eye irritation</li>
                    <li>• Potential allergic reactions</li>
                    <li>• Respiratory irritation (if particles inhaled)</li>
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">🚫 Risk Groups</h3>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Pregnant or nursing women</li>
                    <li>• Children under 18</li>
                    <li>• People with chemical sensitivities</li>
                    <li>• Those with respiratory conditions</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">⚡ Signal Words and Hazard Statements</h3>
                <p className="text-red-700 mb-2"><strong>WARNING:</strong> May cause allergic skin reaction</p>
                <p className="text-red-700 mb-2"><strong>CAUTION:</strong> May cause eye irritation</p>
                <p className="text-red-700"><strong>NOTICE:</strong> Contains partially cured photopolymer materials</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Composition / Material Information</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Typical Range</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hazard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm">Acrylate Oligomers</td>
                      <td className="px-4 py-2 text-sm">40-70%</td>
                      <td className="px-4 py-2 text-sm">Skin sensitizer</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">Methacrylate Monomers</td>
                      <td className="px-4 py-2 text-sm">20-40%</td>
                      <td className="px-4 py-2 text-sm">Skin/eye irritant</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">Photoinitiators</td>
                      <td className="px-4 py-2 text-sm">1-5%</td>
                      <td className="px-4 py-2 text-sm">Potential sensitizer</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm">Pigments/Dyes</td>
                      <td className="px-4 py-2 text-sm">0.1-3%</td>
                      <td className="px-4 py-2 text-sm">Variable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. First Aid Measures</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">👁️ Eye Contact</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Immediately flush with water for 15 minutes</li>
                    <li>• Remove contact lenses if present and easy to do</li>
                    <li>• Seek medical attention if irritation persists</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">👋 Skin Contact</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Wash immediately with soap and water</li>
                    <li>• Remove contaminated clothing</li>
                    <li>• If irritation develops, seek medical advice</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">🫁 Inhalation</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Move to fresh air immediately</li>
                    <li>• If breathing is difficult, seek medical attention</li>
                    <li>• Do not induce vomiting</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">🚫 Ingestion</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Do NOT induce vomiting</li>
                    <li>• Rinse mouth with water</li>
                    <li>• Seek immediate medical attention</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Handling and Storage</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Safe Handling</h3>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Wear protective gloves when handling</li>
                    <li>Use in well-ventilated areas</li>
                    <li>Avoid contact with skin and eyes</li>
                    <li>Wash hands thoroughly after use</li>
                    <li>Do not eat, drink, or smoke during handling</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Storage Requirements</h3>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Store in cool, dry place (15-25°C / 59-77°F)</li>
                    <li>Keep away from direct sunlight and UV light</li>
                    <li>Store away from heat sources</li>
                    <li>Keep container tightly closed</li>
                    <li>Keep away from children and pets</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Personal Protective Equipment (PPE)</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">Recommended PPE</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <p><strong>Gloves:</strong> Nitrile or vinyl disposable gloves</p>
                    <p><strong>Eye Protection:</strong> Safety glasses (if sanding/drilling)</p>
                  </div>
                  <div>
                    <p><strong>Respiratory:</strong> Dust mask if creating particles</p>
                    <p><strong>Clothing:</strong> Long sleeves recommended for sensitive individuals</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Special Populations</h2>
              <div className="space-y-4">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-800 mb-2">👶 Pregnancy and Nursing</h3>
                  <p className="text-sm text-pink-700">
                    Pregnant or nursing women should avoid handling these products due to potential exposure to uncured monomers. Consult healthcare provider before use.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">👦 Children and Adolescents</h3>
                  <p className="text-sm text-yellow-700">
                    Not suitable for children under 14. Ages 14-17 require direct adult supervision. Products are not toys and should not be placed in mouth.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">🫁 Sensitive Individuals</h3>
                  <p className="text-sm text-purple-700">
                    People with chemical sensitivities, asthma, or known allergies to acrylates should use extra caution or avoid handling entirely.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disposal Information</h2>
              <p className="mb-4">
                When disposing of products:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Follow local waste disposal regulations</li>
                <li>Do not incinerate or burn</li>
                <li>Consider recycling programs for 3D printed materials where available</li>
                <li>Contact local waste management for guidance on polymer disposal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Regulatory Information</h2>
              <p className="mb-4">
                This product is manufactured for decorative purposes only and is not regulated as a medical device, food contact material, or toy. Components may be subject to various chemical regulations including TSCA, REACH, and state chemical disclosure laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Manufacturer:</strong> Hastkari LLC (operating as Minimica)</p>
                <p className="mb-2"><strong>Emergency Contact:</strong> customer@minimica.com</p>
                <p className="mb-2"><strong>Business Hours:</strong> Monday-Friday, 9 AM - 5 PM CT</p>
                <p><strong>For medical emergencies:</strong> Contact your local emergency services immediately</p>
              </div>
            </section>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-8">
              <p className="text-sm text-gray-600">
                <strong>Disclaimer:</strong> This safety data sheet provides general guidance based on typical photopolymer resin compositions. Individual reactions may vary. Always consult with healthcare providers for specific medical concerns. Hastkari LLC is not responsible for individual health reactions or misuse of products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}