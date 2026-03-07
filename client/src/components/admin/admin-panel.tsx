import { useState } from "react";
import { useSettings, useUpdateSettings, usePositions, useCreatePosition, useCandidates, useCreateCandidate, useResetElection } from "@/hooks/use-election";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ResultsView } from "@/components/shared/results-view";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, AlertTriangle, Eye, EyeOff, LayoutList, Users, ShieldAlert } from "lucide-react";

export function AdminPanel() {
  const { data: settings } = useSettings();
  const { mutate: updateSettings, isPending: updatingSettings } = useUpdateSettings();
  const { data: positions } = usePositions();
  const { mutate: createPosition, isPending: creatingPos } = useCreatePosition();
  const { data: candidates } = useCandidates();
  const { mutate: createCandidate, isPending: creatingCand } = useCreateCandidate();
  const { mutate: resetElection, isPending: resetting } = useResetElection();
  
  const { toast } = useToast();

  const [posName, setPosName] = useState("");
  const [candName, setCandName] = useState("");
  const [candPos, setCandPos] = useState("");
  const [candPhoto, setCandPhoto] = useState("");

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posName) return;
    createPosition({ name: posName }, {
      onSuccess: () => {
        toast({ title: "Position created" });
        setPosName("");
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candPos) return;
    createCandidate({ name: candName, positionId: Number(candPos), photoUrl: candPhoto || null }, {
      onSuccess: () => {
        toast({ title: "Candidate created" });
        setCandName("");
        setCandPhoto("");
        // Keep position selected to easily add multiple
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleToggleResults = (checked: boolean) => {
    updateSettings({ resultsVisible: checked }, {
      onSuccess: () => toast({ title: checked ? "Results published" : "Results hidden" }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage the election, positions, and view live results.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-grid mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2"><LayoutList className="h-4 w-4" /><span className="hidden sm:inline">Live Results</span></TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /><span className="hidden sm:inline">Positions</span></TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="hidden sm:inline">Candidates</span></TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2"><Eye className="h-4 w-4" /><span className="hidden sm:inline">Settings</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in-50 duration-500">
          <div className="mb-6 flex items-center justify-between bg-muted/50 p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Live Voting Data</h3>
                <p className="text-xs text-muted-foreground">Real-time statistics (Visible only to admins until published)</p>
              </div>
            </div>
          </div>
          <ResultsView />
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Position</CardTitle>
              <CardDescription>Add a new electoral position like "President" or "Secretary".</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPosition} className="flex gap-4 items-end">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="posName">Position Name</Label>
                  <Input 
                    id="posName" 
                    placeholder="e.g., Vice President" 
                    value={posName} 
                    onChange={e => setPosName(e.target.value)} 
                    disabled={creatingPos}
                  />
                </div>
                <Button type="submit" disabled={!posName || creatingPos} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create
                </Button>
              </form>

              <div className="mt-8">
                <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wider">Current Positions</h4>
                <div className="flex flex-wrap gap-2">
                  {positions?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No positions created yet.</p>
                  ) : (
                    positions?.map(p => (
                      <div key={p.id} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-sm font-medium border border-border/50 shadow-sm">
                        {p.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Candidate</CardTitle>
              <CardDescription>Register a new candidate and assign them to a position.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCandidate} className="grid gap-6 max-w-lg">
                <div className="grid gap-2">
                  <Label htmlFor="candPos">Position</Label>
                  <select 
                    id="candPos" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={candPos}
                    onChange={e => setCandPos(e.target.value)}
                    disabled={creatingCand || !positions?.length}
                    required
                  >
                    <option value="" disabled>Select a position</option>
                    {positions?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {!positions?.length && <p className="text-xs text-destructive mt-1">Please create a position first.</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="candName">Candidate Name</Label>
                  <Input 
                    id="candName" 
                    placeholder="Full Name" 
                    value={candName} 
                    onChange={e => setCandName(e.target.value)} 
                    disabled={creatingCand}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="candPhoto">Photo URL (Optional)</Label>
                  {/* landing page user profile default icon */}
                  <Input 
                    id="candPhoto" 
                    placeholder="https://images.unsplash.com/photo-..." 
                    value={candPhoto} 
                    onChange={e => setCandPhoto(e.target.value)} 
                    disabled={creatingCand}
                  />
                  <p className="text-xs text-muted-foreground">Provide a direct image URL.</p>
                </div>
                <Button type="submit" disabled={!candName || !candPos || creatingCand} className="w-full mt-2">
                  {creatingCand ? "Adding..." : "Add Candidate"}
                </Button>
              </form>

              <div className="mt-10 border-t pt-8">
                <h4 className="font-medium mb-4">Registered Candidates</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {candidates?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic col-span-2">No candidates added yet.</p>
                  ) : (
                    candidates?.map(c => {
                      const posName = positions?.find(p => p.id === c.positionId)?.name;
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-sm">
                          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0 border">
                            {c.photoUrl ? (
                              <img src={c.photoUrl} alt={c.name} className="h-full w-full object-cover" />
                            ) : (
                              <Users className="h-5 w-5 m-2.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{posName}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Election Settings</CardTitle>
              <CardDescription>Control visibility and state of the overall election.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="flex flex-row items-center justify-between rounded-xl border p-5 shadow-sm">
                <div className="space-y-1">
                  <Label className="text-base flex items-center gap-2">
                    {settings?.resultsVisible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    Publish Results
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-[400px]">
                    Turn this on to allow students and the public to view the election results. Keep off while voting is ongoing.
                  </p>
                </div>
                <Switch 
                  checked={settings?.resultsVisible ?? false} 
                  onCheckedChange={handleToggleResults}
                  disabled={updatingSettings}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                <div className="space-y-1">
                  <Label className="text-base text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-[400px]">
                    Reset the election. This will delete all votes, reset student voting statuses, and hide results. Candidates and positions will remain.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Reset Election</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all recorded votes and reset all student "has voted" statuses.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          resetElection(undefined, {
                            onSuccess: () => toast({ title: "Election reset successfully" }),
                            onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
                          });
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {resetting ? "Resetting..." : "Yes, reset election"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Ensure BarChart3 is imported for the AdminPanel overview section
import { BarChart3 } from "lucide-react";
