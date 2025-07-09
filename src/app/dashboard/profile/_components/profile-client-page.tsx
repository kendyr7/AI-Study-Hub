'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ChangePasswordDialog } from './change-password-dialog';
import { AvatarSelectionDialog } from './avatar-selection-dialog';

export function ProfileClientPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setDisplayName(user.displayName || '');
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length > 1 && names[0] && names[names.length - 1]) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name[0]?.toUpperCase() || 'U';
    }
    
    const handleUpdateProfile = async () => {
        if (!user || !auth?.currentUser) return;
        
        if (displayName.trim() === (user.displayName || '').trim()) return;

        setIsSaving(true);
        try {
            await updateProfile(auth.currentUser, { displayName });
            toast({ title: "Profile updated successfully!" });
            await auth.currentUser.reload();
            setUser({ ...auth.currentUser });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAvatarSelect = async (url: string) => {
        if (!user || !auth?.currentUser) return;
        
        setIsSaving(true);
        try {
            await updateProfile(auth.currentUser, { photoURL: url });
            toast({ title: "Avatar updated!" });
            await auth.currentUser.reload();
            setUser({ ...auth.currentUser });
        } catch (error: any) {
            console.error("Error updating avatar:", error);
            toast({ title: "Error updating avatar", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
            setIsAvatarDialogOpen(false);
        }
    }


    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
                    <p className="text-muted-foreground">
                        This is how others will see you on the site.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Make changes to your public profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-10 w-28" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                         <Skeleton className="h-10 w-36" />
                         <Skeleton className="h-10 w-28" />
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!user) {
        // This can happen if firebase isn't configured, or user is logged out.
        return (
             <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
                    <p className="text-muted-foreground">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
                <p className="text-muted-foreground">
                This is how others will see you on the site.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Make changes to your public profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.photoURL || ''} alt="User Avatar" />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                         <Button 
                            variant="outline" 
                            onClick={() => setIsAvatarDialogOpen(true)} 
                            disabled={isSaving}
                        >
                            Change Avatar
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email || ''} disabled />
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <ChangePasswordDialog />
                    <Button onClick={handleUpdateProfile} disabled={isSaving || displayName.trim() === (user.displayName || '').trim()}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <AvatarSelectionDialog
                open={isAvatarDialogOpen}
                onOpenChange={setIsAvatarDialogOpen}
                currentAvatar={user.photoURL}
                onSelect={handleAvatarSelect}
                isSaving={isSaving}
            />
        </div>
    );
}
