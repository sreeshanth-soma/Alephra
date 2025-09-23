/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GradientButton from "@/components/ui/gradient-button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Brain, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import BackgroundLines from "@/components/ui/background-lines";
import { WordPullUp } from "@/components/ui/word-pull-up";

export default function SignInPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: `Google sign-in failed: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      toast({
        title: "Error",
        description: "Something went wrong with Google sign-in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Background animated lines */}
      <BackgroundLines />

      {/* Full-width header above card */}
      <div className="pointer-events-none absolute top-40 left-0 right-0 z-20 flex items-center justify-center px-6">
        <WordPullUp
          words="Welcome to MedScan"
          className="whitespace-nowrap text-6xl md:text-7xl lg:text-8xl leading-none text-neutral-900 dark:text-white tracking-tight"
          wrapperFramerProps={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 mt-64">
        {/* Enhanced 3D glassmorphism card */}
        <div className="relative group [perspective:1200px]">
          <div className="absolute -inset-10 rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-transparent blur-2xl" />
          <motion.div
            whileHover={{ rotateX: -2, rotateY: 2, y: -2 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="relative p-[2px] rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.25),rgba(0,0,0,0.25))] shadow-2xl [transform-style:preserve-3d]"
          >
            <Card className="rounded-[1.65rem] border border-white/10 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-xl shadow-xl">
              <div className="pointer-events-none absolute inset-0 rounded-[1.65rem] overflow-hidden">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
              </div>
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold text-center">
                  Sign In to Continue
                </CardTitle>
                <CardDescription className="text-center">
                  Connect with Google to enable appointments and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Sign-In Button - Gradient style - TEMPORARILY COMMENTED OUT */}
                {/* <GradientButton
                  width="100%"
                  height="48px"
                  onClick={handleGoogleSignIn}
                  className="select-none"
                  aria-label="Continue with Google"
                >
                  {isLoading ? "Signing in..." : "Continue with Google"}
                </GradientButton>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      Continue as Guest
                    </span>
                  </div>
                </div> */}

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    onClick={() => router.push(callbackUrl)}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-gray-300 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 text-gray-900 dark:text-white shadow-sm backdrop-blur-md"
                  >
                    Continue without signing in
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>

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
          </motion.div>
        </div>

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
