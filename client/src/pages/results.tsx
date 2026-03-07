import { useSettings } from "@/hooks/use-election";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { ResultsView } from "@/components/shared/results-view";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Results() {
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Election Results
            </h1>
            <p className="text-muted-foreground mt-2">
              View the final tally for all open positions.
            </p>
          </div>
        </div>

        {loadingSettings ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        ) : (!settings?.resultsVisible && !user?.isAdmin) ? (
          <Card className="max-w-2xl mx-auto border-dashed bg-muted/10 mt-12">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
              <div className="bg-background p-4 rounded-full shadow-sm mb-6 border">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Results Hidden</h2>
              <p className="text-base max-w-md mx-auto">
                Results will be announced after the election closes. Check back later to see the outcome.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {!settings?.resultsVisible && user?.isAdmin && (
              <div className="mb-6 bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex items-center gap-3 text-sm font-medium">
                <Lock className="h-4 w-4" />
                These results are currently hidden from students. You can publish them in the Admin Settings.
              </div>
            )}
            <ResultsView />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
