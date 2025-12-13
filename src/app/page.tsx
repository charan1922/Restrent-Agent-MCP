"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Auth State:", { loading, user });

    if (!loading) {
      if (user) {
        console.log("Authenticated. Redirecting to /agent");
        router.push("/agent");
      } else {
        console.log("Not authenticated. Redirecting to /login");
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {loading ? "Checking authentication..." : "Redirecting..."}
        </p>
        {!loading && user && (
          <p className="text-xs text-muted-foreground mt-2">
            Logged in as {user.name}
          </p>
        )}
      </div>
    </div>
  );
}
