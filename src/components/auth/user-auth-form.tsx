"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  AuthError,
} from "firebase/auth";

import { auth } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  signup?: boolean;
}

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="fill-current w-4 h-4">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});


export function UserAuthForm({ className, signup = false, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isProviderLoading, setIsProviderLoading] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  if (!auth) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Not Configured</AlertTitle>
            <AlertDescription>
                Please add your Firebase project credentials to the <code>.env</code> file to enable user sign-in and sign-up.
            </AlertDescription>
        </Alert>
    );
  }

  const handleAuthError = (error: AuthError) => {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-api-key":
      case "auth/configuration-not-found":
        return "Firebase configuration is invalid. Please check your project setup.";
      case "auth/network-request-failed":
        return "A network error occurred. Please check your internet connection and try again.";
      case "auth/popup-closed-by-user":
        return "The sign-in window was closed. Please try again.";
      default:
        console.error("Firebase Auth Error:", error);
        return `An unexpected error occurred: ${error.code}.`;
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (signup) {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      }
      router.push('/dashboard');
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error?.code) {
          errorMessage = handleAuthError(error);
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            title: signup ? "Sign Up Failed" : "Sign In Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleProviderSignIn = async (providerName: 'google' | 'github') => {
    setIsProviderLoading(providerName);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error?.code) {
          errorMessage = handleAuthError(error);
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            title: "Sign In Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsProviderLoading(null);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading || !!isProviderLoading}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        autoComplete={signup ? "new-password" : "current-password"}
                        disabled={isLoading || !!isProviderLoading}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button disabled={isLoading || !!isProviderLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {signup ? "Create Account" : "Sign In"}
                </Button>
            </div>
        </form>
      </Form>
      <div className="relative">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase text-muted-foreground">
          Or continue with
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button" disabled={isLoading || !!isProviderLoading} onClick={() => handleProviderSignIn('github')}>
          {isProviderLoading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
          GitHub
        </Button>
        <Button variant="outline" type="button" disabled={isLoading || !!isProviderLoading} onClick={() => handleProviderSignIn('google')}>
           {isProviderLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
          <span className="ml-2">Google</span>
        </Button>
      </div>
    </div>
  );
}
