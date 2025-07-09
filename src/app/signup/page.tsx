import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
            <CardDescription>Start your AI-powered learning journey today</CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm signup />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary font-semibold">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
