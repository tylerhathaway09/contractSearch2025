export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-sm text-gray-600 mb-8">Last Updated: October 2, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Understory Analytics (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates ContractSearch. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our Service. We are committed to protecting your
            privacy and ensuring transparency about our data practices.
          </p>
          <p className="text-gray-700 mb-4">
            By using ContractSearch, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Email address, full name, and password when you create an account</li>
            <li><strong>Payment Information:</strong> Payment details processed securely through Stripe (we do not store credit card information)</li>
            <li><strong>Communications:</strong> Information you provide when contacting our support team</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Search History:</strong> Queries you perform on our platform, stored indefinitely for product improvement and analytics</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
            <li><strong>Analytics Data:</strong> Collected via Vercel Analytics including page views and user behavior patterns</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Cookies and Tracking Technologies</h3>
          <p className="text-gray-700 mb-4">
            We currently do not use cookies for tracking purposes. However, we may use cookies in the future for analytics,
            user preferences, and partnership tracking with GPOs. If implemented, we will update this policy and provide
            appropriate notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the collected information for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Service Delivery:</strong> To provide, maintain, and improve our contract search platform</li>
            <li><strong>Account Management:</strong> To manage your account, subscription, and access to features</li>
            <li><strong>Product Improvement:</strong> To analyze search patterns and user behavior to enhance our Service</li>
            <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance</li>
            <li><strong>Marketing Communications:</strong> To send you updates about new contracts, features, and Service improvements (you may opt out at any time)</li>
            <li><strong>Analytics:</strong> To understand how users interact with our Service and identify areas for improvement</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
          <p className="text-gray-700 mb-4">
            We may share your information with third parties in the following circumstances:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Service Providers</h3>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Stripe:</strong> Payment processing for Pro subscriptions</li>
            <li><strong>Supabase:</strong> Database and authentication services</li>
            <li><strong>Vercel:</strong> Hosting and analytics services</li>
            <li><strong>Mailchimp (Future):</strong> Email newsletter management (when implemented)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Legal Requirements</h3>
          <p className="text-gray-700 mb-4">
            We may disclose your information if required by law, court order, or government regulation, or if we believe
            disclosure is necessary to protect our rights, your safety, or the safety of others.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Business Transfers</h3>
          <p className="text-gray-700 mb-4">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that
            transaction. We will provide notice before your information is transferred and becomes subject to a different
            privacy policy.
          </p>

          <p className="text-gray-700 mb-4 font-semibold">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for different periods depending on the type of data:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Retained while your account is active</li>
            <li><strong>Search History:</strong> Stored indefinitely for product improvement and analytics purposes</li>
            <li><strong>Payment Records:</strong> Retained as required by financial regulations (typically 7 years)</li>
            <li><strong>Account Deletion:</strong> When you delete your account, most personal data is removed within 30 days, except where retention is required for legal or financial compliance purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
          <p className="text-gray-700 mb-4">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
            <li><strong>Marketing Opt-Out:</strong> Unsubscribe from marketing emails while maintaining your account</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise any of these rights, please contact us at info@understoryanalytics.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security assessments and updates</li>
            <li>Payment processing through PCI-compliant providers (Stripe)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your information,
            we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            Our Service is primarily intended for users in the United States and Canada. If you access our Service from
            outside these regions, your information may be transferred to and processed in the United States. By using our
            Service, you consent to the transfer of your information to countries that may have different data protection
            laws than your country of residence.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information
            from children. If you believe we have collected information from a child, please contact us immediately at
            info@understoryanalytics.com, and we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
          <p className="text-gray-700 mb-4">
            Our Service may contain links to third-party websites, including supplier websites and GPO platforms. We are not
            responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of
            any third-party sites you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
            We will notify you of significant changes via email or through a prominent notice on our Service. The &quot;Last
            Updated&quot; date at the top of this policy indicates when it was last revised.
          </p>
          <p className="text-gray-700 mb-4">
            Your continued use of the Service after changes to this policy constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> info@understoryanalytics.com
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Company:</strong> Understory Analytics
          </p>
          <p className="text-gray-700">
            We will respond to your inquiry within a reasonable timeframe.
          </p>
        </section>
      </div>
    </div>
  );
}
