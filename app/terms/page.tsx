import Link from "next/link"

export default function TermsAndConditionsPage() {
    return (
        <div className="py-20 px-4 md:px-8 max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">
                Terms & Conditions
            </h1>
            <p className="text-sm text-muted-foreground mb-12">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p className="mb-4">
                    These Terms & Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Primenym ("we," "us," or "our"), concerning your access to and use of the {process.env.NEXT_PUBLIC_SITE_URL || 'https://primenym.com'} website as well as any other media form, media channel, mobile website, or application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>
                <p>
                    By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these Terms & Conditions. If you do not agree with all of these terms and conditions, then you are expressly prohibited from using the Site and must discontinue use immediately.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">2. Intellectual Property Rights</h2>
                <p className="mb-4">
                    Unless otherwise indicated, the Site and our Google Looker Studio Connectors are our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">3. User Representations</h2>
                <p className="mb-4">By using the Site, you represent and warrant that:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>all registration information you submit will be true, accurate, current, and complete;</li>
                    <li>you will maintain the accuracy of such information and promptly update such registration information as necessary;</li>
                    <li>you have the legal capacity and you agree to comply with these Terms & Conditions;</li>
                    <li>you are not a minor in the jurisdiction in which you reside;</li>
                    <li>you have the legal authority to bind your organization to these Terms if you are acting on their behalf;</li>
                    <li>you will not configure our connectors to bypass our licensing algorithms or share your API quotas maliciously.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">4. Subscriptions and Payments</h2>
                <p className="mb-4">
                    Certain features of the Site and our Connectors, such as adding multiple data sources or refreshing data at higher frequencies, require a paid subscription.
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Billing:</strong> You will be billed in advance on a recurring and periodic basis (monthly or annually) depending on the subscription plan you select.</li>
                    <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Your cancellation will take effect at the end of the current paid term.</li>
                    <li><strong>Refunds:</strong> Except when required by law, paid subscription fees are non-refundable.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">5. API Usage and Limitations</h2>
                <p className="mb-4">
                    Our Connectors function by securely passing your provided third-party API keys to the respective platforms. You agree that:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>You are solely responsible for acquiring the necessary API access rights from the third-party platforms.</li>
                    <li>You are responsible for any costs or charges imposed by third-party platforms based on your API usage via our Connectors.</li>
                    <li>We are not responsible for changes, deprecation, or downtime of third-party APIs that may cause our connectors to fail.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                <p className="mb-4 text-sm bg-muted/30 p-4 rounded uppercase font-semibold">
                    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
                <p className="mb-4">
                    In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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
