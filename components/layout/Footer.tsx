import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background">
            <div className="container mx-auto py-10 md:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Primenym
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground w-full md:w-3/4">
                            Premium Google Looker Studio connectors for modern businesses.
                            Unlock the power of your data with seamless integrations.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Product</h3>
                        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                            All Connectors
                        </Link>
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                            Pricing
                        </Link>
                        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                            Dashboard
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Support</h3>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                            Contact Us
                        </Link>
                        <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
                            Help Center
                        </Link>
                        <Link href="/status" className="text-sm text-muted-foreground hover:text-foreground">
                            System Status
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Legal</h3>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                            Terms & Conditions
                        </Link>
                        <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground">
                            Cookie Policy
                        </Link>
                    </div>
                </div>

                <div className="mt-10 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Primenym. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Social icons can go here */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
