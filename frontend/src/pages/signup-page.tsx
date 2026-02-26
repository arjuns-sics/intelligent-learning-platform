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
import { IconUserPlus, IconMail, IconLock, IconArrowRight, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks";

export function SignupPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userType, setUserType] = useState<"Student" | "Instructor" | "Admin">("Student");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        const result = await register({
            name,
            email,
            password,
            role: userType,
        });

        if (result.success) {
            navigate("/dashboard", { replace: true });
        } else {
            setError(result.error || "Registration failed. Please try again.");
        }

        setIsLoading(false);
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
                        <IconUserPlus className="size-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>
                        Join our learning community today
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="pl-9"
                                />
                                <IconUserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                            </div>
                        </div>

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
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-9"
                                />
                                <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-9"
                                />
                                <IconLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-type">Account Type</Label>
                            <Select value={userType} onValueChange={(value: "Student" | "Instructor" | "Admin") => setUserType(value)}>
                                <SelectTrigger id="user-type" className="w-full">
                                    <SelectValue placeholder="Select your account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Student">Learner / Student</SelectItem>
                                    <SelectItem value="Instructor">Educator / Teacher</SelectItem>
                                    <SelectItem value="Admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                id="terms"
                                type="checkbox"
                                className="size-4 rounded border-input bg-background"
                                required
                            />
                            <Label htmlFor="terms" className="text-xs">
                                I agree to the <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
                            </Label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                <IconAlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <IconLoader2 className="size-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <IconArrowRight className="size-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}