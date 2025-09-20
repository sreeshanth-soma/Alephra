"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Brain, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting Google sign-in...");
      console.log("Callback URL:", callbackUrl);
      
      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      });
      
      console.log("Sign-in result:", result);
      
      if (result?.error) {
        console.error("Sign-in error:", result.error);
        toast({
          title: "Error",
          description: `Google sign-in failed: ${result.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      toast({
        title: "Error",
        description: "Something went wrong with Google sign-in.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-black rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to MedScan
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered healthcare insights with Google Calendar integration
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Sign In to Continue
            </CardTitle>
            <CardDescription className="text-center">
              Connect with Google to enable appointments and reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign-In Button */}
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Continue as Guest
                </span>
              </div>
            </div>

            <Button 
              onClick={() => router.push(callbackUrl)}
              variant="outline"
              className="w-full h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Continue without signing in
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Features Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Why sign in with Google?
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sync appointments with Google Calendar
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    AI-powered health reminders
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Secure and private data handling
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}