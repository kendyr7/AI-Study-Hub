// NOTE: The 'use client' directive is not necessary for this component as it only uses other client components.
// It will be treated as a client component by default when used inside a client component tree.

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookCopy,
  Lightbulb,
  Settings,
  CircleUser,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// A simple hook to simulate path checking
const useIsActivePath = (path: string) => {
    // In a real app, you would use `usePathname` from `next/navigation`
    // For this static generation, we'll just make Dashboard active.
    return path === '/dashboard';
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const isActive = useIsActivePath(href);
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                <Link href={href}>
                    {icon}
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <NavLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          <NavLink href="/dashboard/topics" icon={<BookCopy />} label="Topics" />
          <NavLink href="/dashboard/review" icon={<Lightbulb />} label="Review" />
          <NavLink href="/dashboard/settings" icon={<Settings />} label="Settings" />
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
                <Link href="/dashboard/profile">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span>User Profile</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
                <Link href="/">
                    <LogOut />
                    <span>Logout</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
