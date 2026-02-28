"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { user, loading, signOut } = useAuth()

    const navItems = [
        { name: "Products", href: "/products" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact Us", href: "/contact" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Primenym
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Auth Section */}
                <div className="hidden md:flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>
                        )
                    )}
                </div>

                {/* Mobile Navigation */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-6 mt-6">
                            <Link href="/" onClick={() => setIsOpen(false)} className="font-bold text-lg">
                                Primenym
                            </Link>
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm font-medium transition-colors hover:text-primary"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="flex flex-col gap-2 mt-4">
                                {!loading && (
                                    user ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-2 px-2 py-1.5">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium leading-none">{user.displayName || 'User'}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
                                                </div>
                                            </div>
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full justify-start">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    Dashboard
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" onClick={() => { signOut(); setIsOpen(false); }}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full">
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link href="/signup" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
