import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function HelpCenterPage() {
    const faqs = [
        {
            question: "How do I install a Primenym looker studio connector?",
            answer: "Once you create an account, you can add your data source API keys in your Dashboard. Then, simply click the 'Add to Looker Studio' button on the specific connector page. You will be prompted to authenticate your Primenym account within Looker Studio, which automatically links your stored sources."
        },
        {
            question: "Is my data stored on your servers?",
            answer: "No. Our servers only store the API keys/credentials you provide to authenticate with the third-party platforms (like Shopify or Facebook Ads). When Looker Studio requests data, our connectors fetch it directly from the source API and pass it straight to Looker Studio. We do not database or cache your underlying business data."
        },
        {
            question: "What happens if a third-party API changes?",
            answer: "We actively monitor changes to the APIs of all supported platforms. If an API is deprecated or updated, our engineering team immediately updates the connector logic to ensure uninterrupted service."
        },
        {
            question: "Can I use one subscription for multiple users?",
            answer: "No, subscriptions are tied to individual accounts. Sharing API quotas or licenses across an organization requires an Enterprise plan."
        },
        {
            question: "How do I cancel my subscription?",
            answer: "You can cancel your subscription at any time from the 'Settings' tab in your Primenym Dashboard. Your access will continue until the end of your current billing cycle."
        }
    ]

    return (
        <div className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                    Help Center
                </h1>
                <p className="text-xl text-muted-foreground">
                    Find answers to our most frequently asked questions.
                </p>
            </div>

            <div className="mb-16">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                <p className="text-muted-foreground mb-6">Our support team is always ready to assist you with any technical issues or billing inquiries.</p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/contact">Contact Support</Link>
                </Button>
            </div>
        </div>
    )
}
