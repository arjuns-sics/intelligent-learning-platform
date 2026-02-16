import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLock, IconMail, IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"learner" | "educator" | "admin">("learner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", { email, password, userType });
  };

  return (
    <div className="min-h-navpage bg-background flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-primary/10 rounded-full blur-3xl opacity-30" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-primary flex items-center justify-center mb-4">
            <IconLock className="size-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                />
                <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9"
                />
                <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-type">Account Type</Label>
              <Select value={userType} onValueChange={(value: "learner" | "educator" | "admin") => setUserType(value)}>
                <SelectTrigger id="user-type" className="w-full">
                  <SelectValue placeholder="Select your account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner / Student</SelectItem>
                  <SelectItem value="educator">Educator / Teacher</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="size-4 rounded border-input bg-background"
                />
                <Label htmlFor="remember-me" className="text-xs">Remember me</Label>
              </div>

              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full gap-2">
              Sign In
              <IconArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}