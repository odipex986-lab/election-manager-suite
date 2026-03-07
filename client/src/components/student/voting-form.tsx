import { useState } from "react";
import { usePositions, useCandidates, useSubmitVote } from "@/hooks/use-election";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export function VotingForm() {
  const { data: positions, isLoading: loadingPos } = usePositions();
  const { data: candidates, isLoading: loadingCand } = useCandidates();
  const { mutate: submitVote, isPending } = useSubmitVote();
  const { toast } = useToast();

  // state to track selected candidate ID for each position ID
  const [selections, setSelections] = useState<Record<number, number>>({});

  if (loadingPos || loadingCand) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
          <p>The ballot is currently empty.</p>
          <p className="text-sm mt-1">Please wait for the administrator to set up the election.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSelectionChange = (positionId: number, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [positionId]: parseInt(candidateId, 10)
    }));
  };

  const isFormComplete = positions.every(p => selections[p.id] !== undefined);

  const handleSubmit = () => {
    if (!isFormComplete) return;

    const votesPayload = Object.entries(selections).map(([posId, candId]) => ({
      positionId: parseInt(posId, 10),
      candidateId: candId
    }));

    submitVote({ votes: votesPayload }, {
      onSuccess: () => {
        toast({ 
          title: "Vote Submitted", 
          description: "Your vote has been successfully recorded. Thank you for participating!" 
        });
      },
      onError: (err) => {
        toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Official Ballot</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Please select exactly one candidate for each position. Your vote is secure and anonymous.
        </p>
      </div>

      <div className="space-y-8">
        {positions.map((position) => {
          const positionCandidates = candidates?.filter(c => c.positionId === position.id) || [];
          
          return (
            <Card key={position.id} className="overflow-hidden border-border/60 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  {position.name}
                  {selections[position.id] && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </CardTitle>
                <CardDescription>Select one candidate</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {positionCandidates.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm italic">
                    No candidates running for this position.
                  </div>
                ) : (
                  <RadioGroup 
                    value={selections[position.id]?.toString()} 
                    onValueChange={(val) => handleSelectionChange(position.id, val)}
                    className="flex flex-col gap-0"
                  >
                    {positionCandidates.map((candidate, idx) => (
                      <div 
                        key={candidate.id} 
                        className={`flex items-center space-x-4 p-4 sm:p-5 transition-colors cursor-pointer border-b last:border-0 ${
                          selections[position.id] === candidate.id ? 'bg-primary/5' : 'hover:bg-muted/30'
                        }`}
                      >
                        <RadioGroupItem value={candidate.id.toString()} id={`c-${candidate.id}`} className="sr-only" />
                        
                        <Label 
                          htmlFor={`c-${candidate.id}`}
                          className="flex items-center gap-4 cursor-pointer w-full"
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selections[position.id] === candidate.id ? 'border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {selections[position.id] === candidate.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                          </div>

                          <Avatar className="h-12 w-12 border shadow-sm shrink-0">
                            <AvatarImage src={candidate.photoUrl || ""} alt={candidate.name} />
                            <AvatarFallback className="bg-secondary font-medium">
                              {candidate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold leading-tight text-foreground truncate">{candidate.name}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-6 mt-12 bg-card/80 backdrop-blur-md p-6 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-medium text-sm">
            {Object.keys(selections).length} of {positions.length} positions selected
          </p>
          {!isFormComplete && (
            <p className="text-xs text-destructive font-medium mt-1">Please complete your ballot before submitting.</p>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="lg" disabled={!isFormComplete || isPending} className="w-full sm:w-auto font-semibold px-8 hover-elevate">
              {isPending ? "Submitting..." : "Review & Submit Vote"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit your ballot?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit? Your vote is final and you cannot change it once submitted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[40vh] overflow-y-auto pr-2 py-2">
              <h4 className="text-sm font-semibold mb-3 border-b pb-2">Your Selections:</h4>
              <ul className="space-y-3">
                {positions.map(p => {
                  const selectedCand = candidates?.find(c => c.id === selections[p.id]);
                  return (
                    <li key={p.id} className="text-sm flex justify-between items-center bg-muted/30 p-2 rounded">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="font-semibold text-right pl-4 truncate max-w-[200px]">{selectedCand?.name || "None"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <AlertDialogFooter className="mt-4 border-t pt-4">
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} className="hover-elevate">
                Confirm & Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
