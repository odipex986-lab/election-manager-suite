import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { AdminPanel } from "@/components/admin/admin-panel";
import { VotingForm } from "@/components/student/voting-form";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();

  // If user is admin, show admin dashboard
  if (user?.isAdmin) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminPanel />
      </ProtectedRoute>
    );
  }

  // If student has already voted, show success message
  if (user?.hasVoted) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto mt-12 animate-in zoom-in-95 duration-500">
          <Card className="border-border/50 shadow-lg text-center overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardContent className="pt-12 pb-12 px-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Vote Recorded!</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Your vote has been successfully recorded and encrypted. Thank you for fulfilling your civic duty.
              </p>
              
              <Link href="/results">
                <Button variant="outline" size="lg" className="hover-elevate">
                  View Election Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // Otherwise, show the voting form
  return (
    <ProtectedRoute>
      <VotingForm />
    </ProtectedRoute>
  );
}
