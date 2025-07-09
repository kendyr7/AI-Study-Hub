'use client';

import * as React from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Settings, CircleUser, LogOut, Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

function NavItem({ href, children }: { href: string, children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-muted-foreground"
            )}
        >
            {children}
        </Link>
    );
}

function MobileNavItem({ href, children, onClick }: { href: string, children: React.ReactNode, onClick: () => void }) {
    const pathname = usePathname();
    const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "text-lg font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-foreground"
            )}
        >
            {children}
        </Link>
    );
}

export function Header() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) {
        console.error("Firebase not configured, cannot log out.");
        // Optionally show a toast message to the user
        return;
    }
    try {
        await signOut(auth);
        router.push('/');
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };
  
  const navItems = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/topics", label: "Topics" },
      { href: "/dashboard/review", label: "Review" },
  ];

  const mobileNavItems = [
    ...navItems,
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/settings", label: "Settings" },
  ]

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between gap-4 border-b border-white/10 bg-background/50 px-4 backdrop-blur-xl md:top-4 md:mx-auto md:w-[calc(100%-3rem)] md:rounded-2xl md:border md:px-6">
      <div className="flex items-center gap-6">
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col border-r-white/10 bg-background/80 p-0 backdrop-blur-xl">
                    <SheetHeader className="border-b border-white/10 p-4">
                        <SheetTitle><Logo /></SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 p-4">
                        {mobileNavItems.map((item) => (
                            <MobileNavItem key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                {item.label}
                            </MobileNavItem>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
        <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard">
                <Logo />
            </Link>
            {navItems.map(item => (
                <NavItem key={item.href} href={item.href}>{item.label}</NavItem>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search..."
                className="w-full max-w-xs pl-10 h-10 bg-white/5 border-none"
            />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile"><CircleUser className="mr-2" />Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings"><Settings className="mr-2" />Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={!auth}>
              <LogOut className="mr-2" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
