'use client';

import * as React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
    <header className="sticky top-4 z-50 w-[calc(100%-2rem)] mx-auto flex h-20 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-background/50 px-6 backdrop-blur-xl md:w-[calc(100%-3rem)]">
      <div className="flex items-center gap-6">
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background/80 backdrop-blur-xl border-r-white/10 flex flex-col p-0">
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
            <DropdownMenuItem asChild>
              <Link href="/"><LogOut className="mr-2" />Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
