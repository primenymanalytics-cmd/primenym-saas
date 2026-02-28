import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              New: Shopify Connector V2
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent max-w-3xl">
              Connect Your Data to Looker Studio in Seconds
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium, high-performance connectors for Shopify, WooCommerce, Facebook Ads, and more.
              Visualize your metrics without the headache.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700">
                  Explore Connectors
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Primenym?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              We build connectors that are fast, reliable, and secure. Focus on your insights, not the pipeline.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-background/60 backdrop-blur border-none shadow-lg">
              <CardHeader>
                <Zap className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our connectors use caching and optimized queries to ensure your Looker Studio reports load instantly.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur border-none shadow-lg">
              <CardHeader>
                <Lock className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We verify every request. Your API keys are encrypted, and we never store your actual business data.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur border-none shadow-lg">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Deep Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access dimensions and metrics that other connectors miss. Get the full picture of your ROI.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Connectors Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Popular Connectors</h2>
            <Link href="/products" className="text-indigo-600 hover:underline font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {['Shopify', 'WooCommerce', 'Facebook Ads', 'TikTok Ads'].map((name) => (
              <Link href={`/products/${name.toLowerCase().replace(' ', '-')}`} key={name} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="group-hover:text-indigo-600 transition-colors">{name}</CardTitle>
                    <CardDescription>Connector for Looker Studio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-muted-foreground text-sm">
                      {name} Icon
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
