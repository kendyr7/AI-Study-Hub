'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, storage } from '@/lib/firebase-client';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ChangePasswordDialog } from './change-password-dialog';

export function ProfileClientPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user && storage && auth?.currentUser) {
            setIsUploading(true);
            const photoRef = storageRef(storage, `profile-photos/${user.uid}/${file.name}`);
            
            uploadBytes(photoRef, file)
                .then(snapshot => getDownloadURL(snapshot.ref))
                .then(url => {
                    if (auth.currentUser) {
                        return updateProfile(auth.currentUser, { photoURL: url });
                    }
                    throw new Error("User not found");
                })
                .then(() => {
                    toast({ title: "Photo updated successfully!" });
                    // Force a reload of user to get new photoURL
                    return auth.currentUser?.reload();
                })
                .then(() => {
                    setUser(auth.currentUser ? { ...auth.currentUser } : null);
                })
                .catch(error => {
                    console.error("Error uploading photo: ", error);
                    toast({ title: "Error uploading photo", description: error.message, variant: "destructive" });
                })
                .finally(() => {
                    setIsUploading(false);
                });
        }
    };
    
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                         <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={isUploading || !storage}
                        >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Change Photo
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
        </div>
    );
}
