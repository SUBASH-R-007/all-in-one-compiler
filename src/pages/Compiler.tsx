import { useState, useEffect, useCallback } from "react";
import { Code2, Zap, RotateCcw, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { LanguageSelector, Language, languages } from "@/components/LanguageSelector";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputPanel } from "@/components/OutputPanel";
import { RunButton } from "@/components/RunButton";
import { Button } from "@/components/ui/button";
import { codeTemplates } from "@/lib/codeTemplates";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { Toaster, toast } from "sonner";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Compiler = () => {
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get("task");
    const { user, updateProgress } = useAuth();
    const navigate = useNavigate();

    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState(codeTemplates.python);
    const { executeCode, isLoading, result, clearResult } = useCodeExecution();

    const [isTaskStarted, setIsTaskStarted] = useState(false);
    const [violations, setViolations] = useState(0);

    useEffect(() => {
        if (!taskId) {
            setIsTaskStarted(true);
        }
    }, [taskId]);

    useEffect(() => {
        if (violations >= 1) {
            updateProgress(Number(taskId), 0);
            toast.error("Violation detected! Test terminated with 0 score.");
            setTimeout(() => navigate("/"), 2000);
        }
    }, [violations, taskId, navigate, updateProgress]);

    const addViolation = useCallback((reason: string) => {
        if (!taskId || !isTaskStarted) return;

        setViolations(prev => {
            const newCount = prev + 1;
            return newCount; // Toast handled in effect for immediate termination
        });
    }, [taskId, isTaskStarted]);

    useEffect(() => {
        if (!isTaskStarted || !taskId) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation("Tab switched or minimized");
            }
        };

        const handleBlur = () => {
            addViolation("Window lost focus");
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                addViolation("Exited fullscreen");
            }
        };

        const handleContextMenu = (e: Event) => {
            e.preventDefault();
        };

        const handleCopy = () => {
            addViolation("Copy attempt detected");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopy);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopy);
        };
    }, [isTaskStarted, taskId, addViolation]);

    const handleStartTask = () => {
        const elem = document.documentElement as any;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        setIsTaskStarted(true);
        toast.success("Task Started! Fullscreen mode enabled.");
    };

    // Task configuration
    const taskPoints: Record<string, number> = {
        "1": 10, "2": 20, "3": 30, "4": 50
    };

    const taskDescriptions: Record<string, string> = {
        "1": "# Task: Basic Input/Output\n# Write a program that accepts user input and prints it back to the console.\n\n",
        "2": "# Task: Data Processing\n# Calculate the average of a list of numbers.\n\n",
        "3": "# Task: Algorithm Design\n# Implement Bubble Sort.\n\n",
        "4": "# Task: Complex Logic\n# Solve the N-Queens problem.\n\n"
    };

    // Load task instructions if taskId is present
    useEffect(() => {
        if (taskId && taskDescriptions[taskId]) {
            // Prepend task instructions to the code template
            setCode(taskDescriptions[taskId] + codeTemplates[language]);
            toast.info(`Task Loaded! Good luck, ${user?.username || 'Coder'}!`);
        } else if (!taskId) {
            setCode(codeTemplates[language]);
        }
    }, [taskId, language]); // Re-run if task or language changes

    const handleRun = () => {
        executeCode(code, language);
    };

    const handleSubmit = () => {
        if (!taskId) return;

        // Simulation of validation
        if (!result.output && !result.error && !result.executionTime) {
            toast.warning("Please run your code first to verify output!");
            return;
        }

        if (result.error) {
            toast.error("You cannot submit code with errors!");
            return;
        }

        updateProgress(Number(taskId), taskPoints[taskId] || 10);
        setTimeout(() => navigate("/"), 1000);
    };

    const handleReset = () => {
        if (taskId && taskDescriptions[taskId]) {
            setCode(taskDescriptions[taskId] + codeTemplates[language]);
        } else {
            setCode(codeTemplates[language]);
        }
        clearResult();
    };

    const currentLang = languages.find((l) => l.id === language);

    if (taskId && !isTaskStarted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Toaster position="top-right" theme="dark" />
                <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Coding Assessment</h1>
                    <div className="text-muted-foreground space-y-3 text-sm text-left bg-secondary/30 p-4 rounded-lg border border-border/50">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" /> Assessment Rules:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Full screen mode is mandatory.</li>
                            <li>Switching tabs or minimizing window is prohibited.</li>
                            <li>Clicking outside the browser window is prohibited.</li>
                            <li>Right-click and Copy actions are prohibited.</li>
                            <li className="text-destructive font-medium">Any violation will result in immediate termination with 0 score.</li>
                        </ul>
                    </div>
                    <Button onClick={handleStartTask} size="lg" className="w-full font-semibold text-lg h-12 shadow-lg shadow-primary/20">
                        Start Assessment
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Toaster position="top-right" theme="dark" />

            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                            </Link>
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Code2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    CodeRunner
                                    <Zap className="w-4 h-4 text-primary animate-pulse-glow" />
                                </h1>
                                <p className="text-xs text-muted-foreground">Online Compiler</p>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <LanguageSelector selected={language} onSelect={setLanguage} />

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {taskId && (
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={isLoading}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Submit Solution
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <RunButton onClick={handleRun} isLoading={isLoading} disabled={!code.trim()} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
                    {/* Editor Panel */}
                    <div className="flex flex-col animate-slide-up">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">Editor</span>
                                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                                    {currentLang?.icon} {currentLang?.name} {currentLang?.version}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {code.split("\n").length} lines
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeEditor code={code} onChange={setCode} language={language} />
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="flex flex-col animate-slide-up" style={{ animationDelay: "0.1s" }}>
                        <div className="mb-3">
                            <span className="text-sm font-medium text-foreground">Console</span>
                        </div>
                        <div className="flex-1 min-h-0 editor-container overflow-hidden">
                            <OutputPanel
                                output={result.output}
                                error={result.error}
                                isLoading={isLoading}
                                executionTime={result.executionTime}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/30 py-3">
                <div className="container mx-auto px-4">
                    <p className="text-center text-xs text-muted-foreground">
                        Please ensure the local compiler server is running. Supports Python, C, and Java.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Compiler;
