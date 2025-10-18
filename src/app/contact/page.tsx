export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <p className="text-gray-700 mb-6">
            Questions about contracts, need support, or want to discuss how Understory can help your institution? We&apos;d love to hear from you!
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h2>
            <p className="text-gray-700 mb-2">
              For general inquiries, technical support, or partnership opportunities:
            </p>
            <p className="text-lg">
              <a
                href="mailto:info@understoryanalytics.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                info@understoryanalytics.com
              </a>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Time</h2>
            <p className="text-gray-700">
              We aim to respond to all inquiries within 1-2 business days. For urgent technical issues affecting your
              account, please include &quot;URGENT&quot; in your email subject line.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account & Billing</h3>
              <p className="text-gray-700">
                For subscription changes, billing questions, or account management, please email us at info@understoryanalytics.com
                with your account details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Data Inquiries</h3>
              <p className="text-gray-700">
                For questions about specific contracts, please verify information directly with the respective GPO or supplier.
                Contract data is provided &quot;as-is&quot; from source organizations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Opportunities</h3>
              <p className="text-gray-700">
                Interested in partnering with Understory or becoming a data provider? Reach out to discuss collaboration
                opportunities at info@understoryanalytics.com.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connect With Us</h2>
          <p className="text-gray-700 mb-4">
            Follow us on LinkedIn for updates about new features, contract additions, and industry insights:
          </p>
          <a
            href="https://www.linkedin.com/company/understoryanalytics/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Understory Analytics on LinkedIn
          </a>
        </section>
      </div>
    </div>
  );
}
