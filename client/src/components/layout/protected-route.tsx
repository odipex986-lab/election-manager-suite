import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Navbar } from "./navbar";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && requireAdmin && !user.isAdmin) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && !user.isAdmin)) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
