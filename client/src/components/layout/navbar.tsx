import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Vote, LogOut, LayoutDashboard, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Vote className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">UniVote</span>
        </Link>

        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex gap-4">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          ) : user ? (
            <>
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline-block">Dashboard</span>
              </Link>
              
              <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline-block">Results</span>
              </Link>
              
              <div className="flex items-center gap-4 ml-2 border-l pl-4">
                <span className="text-sm font-semibold hidden md:inline-block">
                  {user.username} {user.isAdmin && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-1">Admin</span>}
                </span>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Log out</span>
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
