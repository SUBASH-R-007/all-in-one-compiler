import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
    id: string;
    username: string;
    email: string;
    completedTasks: number[];
    xp: number;
}

interface AuthContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    updateProgress: (taskId: number, xp: number) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check local storage for session
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (username: string) => {
        // For now, mock login with personalization
        // In a real app, this would verify credentials with backend
        const mockUser: User = {
            id: "1",
            username,
            email: `${username.toLowerCase()}@example.com`,
            completedTasks: [],
            xp: 0
        };

        // Check if we have existing data for this mock user in local storage
        const existingData = localStorage.getItem(`user_data_${username}`);
        const finalUser = existingData ? JSON.parse(existingData) : mockUser;

        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(finalUser));
        toast.success(`Welcome back, ${username}!`);
        navigate("/");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        toast.info("Logged out successfully");
        navigate("/login");
    };

    const updateProgress = (taskId: number, xp: number) => {
        if (!user) return;

        if (user.completedTasks.includes(taskId)) return;

        const updatedUser = {
            ...user,
            completedTasks: [...user.completedTasks, taskId],
            xp: user.xp + xp
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Persist specific user data
        localStorage.setItem(`user_data_${user.username}`, JSON.stringify(updatedUser));
        toast.success(`Task Completed! You earned ${xp} XP!`);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProgress, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
