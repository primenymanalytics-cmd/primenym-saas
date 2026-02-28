"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Loader2, Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            if (!db) {
                throw new Error("Firebase not initialized. Please check your environment variables.")
            }

            await addDoc(collection(db, "contact_messages"), {
                ...formData,
                createdAt: serverTimestamp(),
                status: "new"
            })

            setSuccess(true)
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (err: any) {
            console.error("Error sending message:", err)
            setError(err.message || "Failed to send message. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-20">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                    Have a question about our connectors? Need enterprise support? We're here to help.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get in Touch</CardTitle>
                            <CardDescription>
                                Fill out the form and our team will get back to you within 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Message Sent!</h3>
                                    <p className="text-green-600 dark:text-green-300">
                                        Thank you in reaching out. We'll be in touch shortly.
                                    </p>
                                    <Button variant="outline" onClick={() => setSuccess(false)}>
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="John Doe"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            placeholder="Support / Sales / Other"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder="How can we help you?"
                                            className="min-h-[120px]"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Mail className="h-5 w-5 text-indigo-600" />
                                <span>support@primenym.com</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Phone className="h-5 w-5 text-indigo-600" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <MapPin className="h-5 w-5 text-indigo-600" />
                                <span>123 Data Street, Analytics City, CA 94000</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-950 text-white border-none">
                        <CardHeader>
                            <CardTitle className="text-white">Enterprise Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300 mb-4">
                                Need a custom implementation or SLA? Our enterprise team is ready to assist with dedicated support channels.
                            </p>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    setFormData({ ...formData, subject: "Enterprise Sales Inquiry" })
                                    document.getElementById('name')?.focus()
                                }}
                            >
                                Contact Sales
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
