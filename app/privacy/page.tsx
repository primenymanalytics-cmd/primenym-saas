import Link from "next/link"

export default function PrivacyPolicyPage() {
    return (
        <div className="py-20 px-4 md:px-8 max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
                Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground mb-12">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-4">
                    Welcome to Primenym ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website ({process.env.NEXT_PUBLIC_SITE_URL || 'https://primenym.com'}), use our SaaS platform, and specifically when you use our Google Looker Studio Partner Connectors.
                </p>
                <p>
                    By accessing or using our services, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <p className="mb-2">We collect information in the following ways:</p>

                <h3 className="text-xl font-semibold mt-4 mb-2">2.1. Information You Provide to Us</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Account Data:</strong> When you register an account, we collect your name, email address, password, and profile image (if using Google Auth).</li>
                    <li><strong>Payment Data:</strong> If you make a purchase, payment information is processed securely by our payment provider (Stripe). We do not store full credit card numbers.</li>
                    <li><strong>API Keys and Authentication Tokens:</strong> To functioning as a bridge for Looker Studio, our system securely encrypts and stores the API keys, access tokens, or credentials you provide to connect to third-party data sources (e.g., Shopify, Facebook Ads).</li>
                    <li><strong>Communication Data:</strong> Information you provide when contacting our support team or filling out contact forms.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-4 mb-2">2.2. Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Usage Data:</strong> We automatically collect certain information when you visit our website, including IP address, browser type, operating system, and pages visited.</li>
                    <li><strong>Connector Telemetry:</strong> When using our Looker Studio connectors, we collect metadata regarding the usage of the connector (e.g., frequency of data refreshes, error logs) to monitor performance and enforce license limits. <strong>We do not log the underlying raw row data returned from the third-party APIs.</strong></li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use the collected information for the following purposes:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>To provide, operate, and maintain our website and Looker Studio connectors.</li>
                    <li>To securely authenticate your requests between Google Looker Studio and your selected third-party data sources.</li>
                    <li>To process transactions and manage your SaaS subscription via our payment processor.</li>
                    <li>To communicate with you regarding updates, security alerts, and support messages.</li>
                    <li>To detect, prevent, and address technical issues or fraudulent activity.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">4. Google Looker Studio & API Data</h2>
                <p className="mb-4 border-l-4 border-indigo-600 pl-4 py-2 bg-indigo-50 dark:bg-indigo-950/30">
                    <strong>Important Disclosure for Looker Studio Users:</strong> Primenym connectors act solely as a secure passthrough layer.
                </p>

                <h3 className="text-xl font-semibold mt-4 mb-2">4.1. Data Passthrough</h3>
                <p className="mb-4">
                    When our Google Apps Script (GAS) connectors execute, they utilize your stored API keys to fetch data directly from the third-party platforms. This fetched data is transmitted back to your Looker Studio dashboard.
                </p>

                <h3 className="text-xl font-semibold mt-4 mb-2">4.2. No Data Storage</h3>
                <p className="mb-4">
                    <strong>We do not store, database, or cache the raw business data (metrics, dimensions, or row-level statistics) retrieved from your connected API sources.</strong> The data transit happens in memory to satisfy the Looker Studio `getData()` request and is immediately discarded by our servers.
                </p>

                <h3 className="text-xl font-semibold mt-4 mb-2">4.3. Google API Services User Data Policy</h3>
                <p className="mb-4">
                    Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">5. Sharing of Your Information</h2>
                <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share information only in the following situations:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Service Providers:</strong> We share data with trusted third-party vendors who provide services on our behalf (e.g., hosting via Vercel/Google Cloud, payment processing via Stripe, database via Firebase). These entities are bound by confidentiality agreements.</li>
                    <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes, or to protect our rights or the safety of others.</li>
                    <li><strong>Business Transfers:</strong> In connection with or during negotiations of any merger, sale of company assets, financing, or acquisition.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">6. Security of Your Information</h2>
                <p className="mb-4">
                    We use administrative, technical, and physical security measures to help protect your personal information and API credentials. Firebease/Firestore handles the encryption of data at rest and in transit. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
                <p className="mb-4">Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Access, update, or delete the personal information we have on you.</li>
                    <li>Opt-out of marketing communications.</li>
                    <li>Revoke connector access from your Primenym dashboard or your Google Account settings at any time.</li>
                </ul>
                <p>To exercise these rights, please contact us using the information below.</p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                    We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                <p className="mb-4">
                    If you have questions or comments about this Privacy Policy, please contact us at:
                </p>
                <address className="not-italic bg-muted/50 p-4 rounded-lg">
                    <strong>Primenym Support</strong><br />
                    Email: support@primenym.com<br />
                    <Link href="/contact" className="text-indigo-600 hover:underline mt-2 inline-block">Use our Contact Form</Link>
                </address>
            </section>
        </div>
    )
}
