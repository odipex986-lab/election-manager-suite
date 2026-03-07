import { usePositions, useCandidates, useResults } from "@/hooks/use-election";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export function ResultsView() {
  const { data: positions, isLoading: loadingPos } = usePositions();
  const { data: candidates, isLoading: loadingCand } = useCandidates();
  const { data: results, isLoading: loadingRes } = useResults();

  if (loadingPos || loadingCand || loadingRes) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!positions?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>No election data available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {positions.map((position) => {
        const positionCandidates = candidates?.filter(c => c.positionId === position.id) || [];
        
        // Calculate total votes for this position to determine percentage bars
        const totalVotes = positionCandidates.reduce((acc, c) => {
          const voteCount = results?.find(r => r.candidateId === c.id)?.voteCount || 0;
          return acc + voteCount;
        }, 0);

        // Sort candidates by vote count descending
        const sortedCandidates = [...positionCandidates].sort((a, b) => {
          const votesA = results?.find(r => r.candidateId === a.id)?.voteCount || 0;
          const votesB = results?.find(r => r.candidateId === b.id)?.voteCount || 0;
          return votesB - votesA;
        });

        return (
          <Card key={position.id} className="overflow-hidden border-border/50 shadow-sm">
            <CardHeader className="bg-muted/40 border-b pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{position.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {totalVotes} total votes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/50">
                {sortedCandidates.length === 0 ? (
                  <li className="p-6 text-center text-sm text-muted-foreground">
                    No candidates for this position.
                  </li>
                ) : (
                  sortedCandidates.map((candidate, idx) => {
                    const voteCount = results?.find(r => r.candidateId === candidate.id)?.voteCount || 0;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isWinner = totalVotes > 0 && idx === 0 && voteCount > 0;

                    return (
                      <li key={candidate.id} className="p-4 sm:p-6 hover:bg-muted/20 transition-colors relative">
                        <div className="flex items-center gap-4 relative z-10">
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={candidate.photoUrl || ""} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate flex items-center gap-2">
                              {candidate.name}
                              {isWinner && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Leading</span>}
                            </p>
                            <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden flex">
                              <div 
                                className="bg-primary transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right pl-4">
                            <p className="font-bold text-lg">{voteCount}</p>
                            <p className="text-xs text-muted-foreground font-medium">{percentage}%</p>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
