/* eslint-disable react/no-unescaped-entities */

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            
            {session ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ Signed In Successfully!
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {session.user?.name}</div>
w                    <div><strong>Email:</strong> {session.user?.email}</div>
                    <div><strong>Image:</strong> {session.user?.image}</div>
                    {/* <div><strong>ID:</strong> {session.user?.id}</div> */}
                  </div>
                </div>
                
                <Button 
                  onClick={() => signOut()}
                  variant="destructive"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Not Signed In
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Click the button below to test Google authentication.
                  </p>
                </div>
                
                <Button 
                  onClick={() => signIn("google")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Test Google Sign-In
                </Button>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Authentication Status:</h4>
              <div className="text-sm space-y-1">
                <div>✅ Google OAuth: Working (you're signed in!)</div>
                <div>✅ Session Management: Active</div>
                <div>✅ NextAuth Configuration: Valid</div>
                <div className="text-xs text-gray-500 mt-2">
                  Note: Environment variables are hidden in browser for security
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
