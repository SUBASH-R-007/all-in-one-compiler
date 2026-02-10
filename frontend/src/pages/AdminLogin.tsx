import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { adminLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;
        
        setIsLoading(true);
        await adminLogin(password);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Back to Login Link */}
                <div className="text-center">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Team Login
                    </Link>
                </div>

                {/* Admin Login Card */}
                <Card className="border-2 border-orange-500/20 shadow-2xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter admin password to access the management panel
                            </CardDescription>
                        </div>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Admin Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter admin password"
                                        className="pr-10"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </div>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Access Admin Panel
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p>🔒 This is a secure admin area. Only authorized personnel should access this page.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;