import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote } from "lucide-react";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    login({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg">
            <Vote className="h-8 w-8" />
          </div>
        </div>
        
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-2 text-center pb-8">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome to UniVote</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access the election portal
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">Username or Student ID</Label>
                <Input 
                  id="username" 
                  placeholder="e.g. jdoe24"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6 pb-8">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]" 
                disabled={isLoggingIn || !username || !password}
              >
                {isLoggingIn ? "Authenticating..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Secure College Election Voting System
        </p>
      </div>
    </div>
  );
}
