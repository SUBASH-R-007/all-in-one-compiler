import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';

export interface Question {
    id: string;
    content: string; // The riddle text, or problem description
    type?: "riddle" | "debugging" | "blackbox" | "case-study" | "coding"; // Inherited from task usually, but explicit is good

    // For coding/debugging
    language?: string;
    codeSnippet?: string; // The buggy code or starter template
    sampleInput?: string;
    sampleOutput?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    points: number;
    type: "debugging" | "coding" | "riddle" | "blackbox" | "case-study";
    questions: Question[];
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, "id">) => void;
    deleteTask: (id: number) => void;
    addQuestion: (taskId: number, question: Omit<Question, "id">) => void;
    deleteQuestion: (taskId: number, questionId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Initial default tasks (The 4 Rounds)
const defaultTasks: Task[] = [
    {
        id: 1,
        title: "Round 1: Brain Teaser",
        description: "Solve these riddles to test your lateral thinking.",
        difficulty: "Easy",
        points: 10,
        type: "riddle",
        questions: [
            {
                id: "r1-q1",
                content: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"
            }
        ]
    },
    {
        id: 2,
        title: "Round 2: Fix the Bug",
        description: "Identify and fix the bugs in the provided code snippets.",
        difficulty: "Medium",
        points: 20,
        type: "debugging",
        questions: [
            {
                id: "r2-q1",
                content: "Fix the factorial function.",
                language: "python",
                codeSnippet: "def factorial(n):\n    if n == 0:\n        return 0  # Bug here? Factorial of 0 is 1\n    return n * factorial(n-1)"
            }
        ]
    },
    {
        id: 3,
        title: "Round 3: Blackbox Challenge",
        description: "Write code to match the expected output without seeing the implementation logic.",
        difficulty: "Hard",
        points: 30,
        type: "blackbox",
        questions: [
            {
                id: "r3-q1",
                content: "Write code that takes an integer 'n' and returns the nth Fibonacci number.",
                codeSnippet: "# Write your solution here\n"
            }
        ]
    },
    {
        id: 4,
        title: "Round 4: Case Study",
        description: "Analyze the scenario and pitch your solution.",
        difficulty: "Expert",
        points: 50,
        type: "case-study",
        questions: [
            {
                id: "r4-q1",
                content: "Techception is launching a new AI compiler. Pitch a marketing strategy to reach 1 million users in 6 months."
            }
        ]
    }
];

export const TaskProvider = ({ children }: { children: ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            try {
                const parsedTasks: Task[] = JSON.parse(storedTasks);
                // Migration: Ensure all tasks have a questions array
                const validTasks = parsedTasks.map(t => ({
                    ...t,
                    questions: Array.isArray(t.questions) ? t.questions : []
                }));
                setTasks(validTasks);
            } catch (e) {
                console.error("Failed to parse tasks", e);
                setTasks(defaultTasks);
            }
        } else {
            setTasks(defaultTasks);
        }
    }, []);

    // Sync to local storage
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    }, [tasks]);

    const addTask = (newTask: Omit<Task, "id">) => {
        setTasks(prev => {
            const id = prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1;
            return [...prev, { ...newTask, id, questions: newTask.questions || [] }];
        });
    };

    const deleteTask = (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const addQuestion = (taskId: number, question: Omit<Question, "id">) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const currentQuestions = task.questions || [];
                return {
                    ...task,
                    questions: [...currentQuestions, { ...question, id: uuidv4() }]
                };
            }
            return task;
        }));
    };

    const deleteQuestion = (taskId: number, questionId: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const currentQuestions = task.questions || [];
                return {
                    ...task,
                    questions: currentQuestions.filter(q => q.id !== questionId)
                };
            }
            return task;
        }));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, deleteTask, addQuestion, deleteQuestion }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error("useTasks must be used within a TaskProvider");
    }
    return context;
};
