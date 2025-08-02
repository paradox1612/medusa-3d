import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Minimica',
  description: 'Minimica Privacy Policy - How we protect and handle your personal data',
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: August 2, 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction and Scope</h2>
              <p className="mb-4">
                Hastkari LLC, operating as Minimica ("Company," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and AI-powered 3D model generation services (collectively, the "Services").
              </p>
              <p className="mb-4">
                This Privacy Policy applies to all users of our Services and covers all personal data processing activities conducted by Minimica. By using our Services, you consent to the data practices described in this Privacy Policy.
              </p>
              <p className="mb-4 font-semibold">
                IMPORTANT: Please read this Privacy Policy carefully. If you do not agree with our policies and practices, do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <p className="mb-2">We collect the following categories of personal information:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>Account Information:</strong> Full name, email address, phone number, username and password</li>
                  <li><strong>Billing Information:</strong> Billing address, shipping address, payment method details</li>
                  <li><strong>Communication Data:</strong> Customer service inquiries, survey responses, and feedback</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">User-Generated Content</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>Image Data:</strong> Digital images uploaded for 3D model generation and image metadata</li>
                  <li><strong>Creative Content:</strong> Custom design requests, project descriptions, and user reviews</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Technical and Usage Information</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>Device Information:</strong> IP address, device type, operating system, and browser type</li>
                  <li><strong>Usage Analytics:</strong> Pages visited, time spent, click patterns, and feature usage</li>
                  <li><strong>Cookies:</strong> Session cookies, persistent cookies, and local storage data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Primary Business Purposes</h3>
                <p className="mb-2">We use your personal information for:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Creating and managing your account</li>
                  <li>Processing orders and payments</li>
                  <li>Generating custom 3D models using AI technology</li>
                  <li>Manufacturing and shipping products</li>
                  <li>Providing customer support and technical assistance</li>
                  <li>Training and refining our AI algorithms (using anonymized data)</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Communication</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Order confirmations and status updates</li>
                  <li>Shipping notifications and delivery updates</li>
                  <li>Account security alerts and important service announcements</li>
                  <li>Marketing communications (with your consent)</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Legal and Compliance</h3>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Complying with applicable laws and regulations</li>
                  <li>Responding to legal requests and court orders</li>
                  <li>Enforcing our Terms of Service</li>
                  <li>Protecting against fraud, abuse, and security threats</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Third Parties</h2>
              <p className="mb-4">
                <strong>We do not sell, rent, or trade your personal data.</strong> We may share limited information with trusted third parties only as necessary to provide our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Payment Processors:</strong> Stripe, PayPal, or other payment gateways to process transactions</li>
                <li><strong>AI Processing Services:</strong> Hugging Face, AWS, or other AI platforms to generate 3D models</li>
                <li><strong>Shipping Providers:</strong> FedEx, UPS, DHL, USPS, or local carriers to deliver orders</li>
                <li><strong>Cloud Storage:</strong> MinIO, AWS S3, or similar services to securely store data</li>
                <li><strong>Analytics Services:</strong> Google Analytics for website analytics (anonymized data only)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              </ul>
              <p className="mb-4">
                All third-party vendors are contractually bound to maintain data confidentiality and use your information only for specified purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Universal Rights</h3>
                <p className="mb-2">You have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">GDPR Rights (EU Residents)</h3>
                <p className="mb-2">If you are located in the European Union, you have additional rights including:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Restriction of processing in certain circumstances</li>
                  <li>Right to object to automated decision-making</li>
                  <li>Right to lodge complaints with supervisory authorities</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">CCPA Rights (California Residents)</h3>
                <p className="mb-2">If you are a California resident, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Know what personal information is collected and how it's used</li>
                  <li>Delete personal information (with certain exceptions)</li>
                  <li>Opt-out of the sale of personal information (Note: We do not sell personal information)</li>
                  <li>Non-discrimination for exercising privacy rights</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Exercising Your Rights</h3>
                <p className="mb-2">To exercise any privacy rights, contact us at:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li><strong>Email:</strong> customer@minimica.com</li>
                  <li><strong>Subject Line:</strong> "Privacy Rights Request"</li>
                  <li><strong>Response Time:</strong> Within 30 days</li>
                </ul>
                <p className="mb-4">
                  We may require additional information to verify your identity before processing requests.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement comprehensive technical and organizational safeguards to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Encryption:</strong> All data transmission uses HTTPS/TLS encryption and stored data uses AES-256 encryption</li>
                <li><strong>Access Controls:</strong> Multi-factor authentication and role-based access with principle of least privilege</li>
                <li><strong>Monitoring:</strong> Comprehensive audit logs and intrusion detection systems</li>
                <li><strong>Security Testing:</strong> Regular security assessments and penetration testing</li>
                <li><strong>Staff Training:</strong> Regular privacy and security training for all employees</li>
                <li><strong>Incident Response:</strong> Comprehensive data breach response plan with rapid notification procedures</li>
              </ul>
              <p className="mb-4">
                While we implement strong security measures, no system is 100% secure. We commit to notifying you of any significant data breaches as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your data only as long as necessary for the purposes outlined in this policy:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Uploaded Images:</strong> Maximum 30 days after 3D model generation, then permanently deleted</li>
                <li><strong>Order Records:</strong> 7 years for tax, accounting, and legal compliance</li>
                <li><strong>Account Data:</strong> Until account deletion or 3 years of inactivity</li>
                <li><strong>Marketing Data:</strong> Until consent is withdrawn or contact becomes inactive</li>
                <li><strong>Customer Support Records:</strong> 3 years for quality assurance</li>
                <li><strong>Analytics Data:</strong> Anonymized and retained indefinitely for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Required for site functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand site usage (with your consent)</li>
                <li><strong>Marketing Cookies:</strong> Used for personalized advertising (with your consent)</li>
              </ul>
              <p className="mb-4">
                You can manage cookie preferences through your browser settings or our cookie banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your data may be processed in countries outside your residence, including the United States and other jurisdictions where our service providers operate. We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions for data transfers to approved countries</li>
                <li>Certification schemes and privacy frameworks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will delete it immediately and take steps to prevent future collection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. Material changes will be communicated via email or prominent notice on our website at least 30 days before they take effect. Continued use of our Services after changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="mb-4">
                For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2"><strong>Email:</strong> customer@minimica.com</p>
                <p className="mb-2"><strong>Company:</strong> Hastkari LLC (operating as Minimica)</p>
                <p className="mb-2"><strong>Jurisdiction:</strong> State of Texas, USA</p>
                <p className="mb-2"><strong>Response Time:</strong> Within 5 business days</p>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority (for EU residents) or the California Attorney General (for California residents).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}