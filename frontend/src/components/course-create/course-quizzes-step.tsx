/**
 * Course Quizzes Step
 * Third step - create and manage quizzes for the course
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    IconPlus,
    IconTrash,
    IconPencil,
    IconQuestionMark,
    IconClock,
    IconTarget,
    IconListCheck,
    IconGripVertical,
    IconCircleCheck,
    IconCircleX,
    IconChevronDown,
    IconChevronUp,
    IconAlertCircle,
    IconSparkles,
    IconX,
    IconLoader2,
    IconBook,
} from "@tabler/icons-react";
import type { CourseFormData, Quiz, QuizQuestion } from "@/pages/course-create-page";
import { useGenerateQuizzes } from "@/hooks/use-queries";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

interface CourseQuizzesStepProps {
    formData: CourseFormData;
    updateFormData: (data: Partial<CourseFormData>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const QUESTION_TYPES = [
    { value: "multiple-choice", label: "Multiple Choice", icon: IconListCheck },
    { value: "true-false", label: "True / False", icon: IconCircleCheck },
];

export function CourseQuizzesStep({
    formData,
    updateFormData,
}: CourseQuizzesStepProps) {
    const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [quizFormData, setQuizFormData] = useState<Partial<Quiz>>({});
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    
    // AI Quiz generation state
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [aiQuizModuleId, setAiQuizModuleId] = useState<string>("all");
    const [aiNumQuizzes, setAiNumQuizzes] = useState(1);
    const [aiQuestionsPerQuiz, setAiQuestionsPerQuiz] = useState(5);
    const [includeTranscripts, setIncludeTranscripts] = useState(true);
    const [generationMetadata, setGenerationMetadata] = useState<{
        transcriptsUsed?: boolean;
        totalVideos?: number;
        processedVideos?: number;
        skippedVideos?: number;
    } | null>(null);
    const [generationStep, setGenerationStep] = useState<string>("");
    const generateQuizzesMutation = useGenerateQuizzes();

    // Reset metadata when dialog is closed
    useEffect(() => {
        if (!isAiDialogOpen) {
            setGenerationMetadata(null);
            setGenerationStep("");
        }
    }, [isAiDialogOpen]);

    // Update generation step based on mutation state and time elapsed
    useEffect(() => {
        if (generateQuizzesMutation.isPending) {
            if (includeTranscripts) {
                // Show progressive steps for transcript processing
                const startTime = Date.now();
                const elapsed = Date.now() - startTime;
                
                if (elapsed < 10000) {
                    setGenerationStep("📥 Fetching video transcripts...");
                } else if (elapsed < 20000) {
                    setGenerationStep("📝 Summarizing long transcripts...");
                } else if (elapsed < 30000) {
                    setGenerationStep("💡 Extracting key concepts from videos...");
                } else {
                    setGenerationStep("🤖 Generating quiz questions with AI...");
                }

                // Update step every 10 seconds
                const interval = setInterval(() => {
                    const now = Date.now();
                    const total = now - startTime;
                    if (total < 20000) {
                        setGenerationStep("📝 Summarizing long transcripts...");
                    } else if (total < 30000) {
                        setGenerationStep("💡 Extracting key concepts from videos...");
                    } else {
                        setGenerationStep("🤖 Generating quiz questions with AI...");
                    }
                }, 10000);

                return () => clearInterval(interval);
            } else {
                setGenerationStep("🤖 Generating quizzes with AI...");
            }
        }
    }, [generateQuizzesMutation.isPending, includeTranscripts]);

    const handleAddQuiz = () => {
        const newQuiz: Quiz = {
            id: generateId(),
            title: "New Quiz",
            moduleId: formData.modules[0]?.id || null,
            timeLimit: 15,
            passingScore: 70,
            questions: [],
        };
        updateFormData({
            quizzes: [...formData.quizzes, newQuiz],
        });
        setExpandedQuizId(newQuiz.id);
        setEditingQuizId(newQuiz.id);
        setQuizFormData(newQuiz);
    };

    const handleUpdateQuiz = (quizId: string, data: Partial<Quiz>) => {
        updateFormData({
            quizzes: formData.quizzes.map((q) =>
                q.id === quizId ? { ...q, ...data } : q
            ),
        });
    };

    const handleRemoveQuiz = (quizId: string) => {
        updateFormData({
            quizzes: formData.quizzes.filter((q) => q.id !== quizId),
        });
    };

    const handleAddQuestion = (quizId: string) => {
        const newQuestion: QuizQuestion = {
            id: generateId(),
            question: "",
            type: "multiple-choice",
            options: ["", "", "", ""],
            correctAnswer: 0,
            points: 1,
        };
        handleUpdateQuiz(quizId, {
            questions: [
                ...(formData.quizzes.find((q) => q.id === quizId)?.questions || []),
                newQuestion,
            ],
        });
        setEditingQuestionId(newQuestion.id);
    };

    const handleUpdateQuestion = (
        quizId: string,
        questionId: string,
        data: Partial<QuizQuestion>
    ) => {
        updateFormData({
            quizzes: formData.quizzes.map((q) =>
                q.id === quizId
                    ? {
                        ...q,
                        questions: q.questions.map((ques) =>
                            ques.id === questionId ? { ...ques, ...data } : ques
                        ),
                    }
                    : q
            ),
        });
    };

    const handleRemoveQuestion = (quizId: string, questionId: string) => {
        const quiz = formData.quizzes.find((q) => q.id === quizId);
        if (quiz) {
            handleUpdateQuiz(quizId, {
                questions: quiz.questions.filter((q) => q.id !== questionId),
            });
        }
    };

    const handleAiGenerateQuizzes = async () => {
        if (!formData.title || !formData.description) {
            toast.error("Please fill in course title and description first");
            return;
        }

        try {
            const generationData = {
                courseTitle: formData.title,
                courseDescription: formData.description,
                modules: formData.modules,
                learningObjectives: formData.learningObjectives,
                numQuizzes: aiQuizModuleId === "all" ? aiNumQuizzes : 1,
                questionsPerQuiz: aiQuestionsPerQuiz,
                moduleId: aiQuizModuleId === "all" ? undefined : aiQuizModuleId,
                includeTranscripts: includeTranscripts,
            };

            const result = await generateQuizzesMutation.mutateAsync(generationData);

            if (result.data?.quizzes) {
                // Store metadata
                if (result.data.metadata) {
                    setGenerationMetadata(result.data.metadata);
                }

                // Add generated quizzes to form data
                const newQuizzes = result.data.quizzes.map((quiz) => ({
                    ...quiz,
                    id: generateId(),
                    questions: quiz.questions.map((q) => ({
                        ...q,
                        id: generateId(),
                    })),
                }));

                updateFormData({
                    quizzes: [...formData.quizzes, ...newQuizzes],
                });

                // Show enhanced success message with transcript info
                const transcriptMsg = result.data.metadata?.transcriptsUsed
                    ? ` using ${result.data.metadata.processedVideos}/${result.data.metadata.totalVideos} video transcripts`
                    : "";
                
                toast.success(
                    `Generated ${newQuizzes.length} quiz(es) with ${newQuizzes.reduce(
                        (acc, q) => acc + q.questions.length,
                        0
                    )} questions${transcriptMsg}`
                );
                setIsAiDialogOpen(false);
            }
        } catch (error) {
            console.error("Failed to generate quizzes:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to generate quizzes. Please try again."
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <IconQuestionMark className="size-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Quizzes & Assessments</h2>
                        <p className="text-sm text-muted-foreground">
                            Create quizzes to test student knowledge
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsAiDialogOpen(true)}
                    className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
                >
                    <IconSparkles className="size-4" />
                    Generate with AI
                </Button>
            </div>

            {/* Add Quiz Button */}
            <div className="flex gap-2">
                <Button onClick={handleAddQuiz} className="gap-2">
                    <IconPlus className="size-4" />
                    Create Quiz Manually
                </Button>
            </div>

            {/* Quizzes List */}
            {formData.quizzes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
                    <IconQuestionMark className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No quizzes yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Create quizzes to assess student understanding
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button onClick={handleAddQuiz} className="gap-2">
                            <IconPlus className="size-4" />
                            Create Manually
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsAiDialogOpen(true)}
                            className="gap-2"
                        >
                            <IconSparkles className="size-4" />
                            Generate with AI
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {formData.quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="border rounded-xl overflow-hidden bg-card shadow-sm"
                        >
                            {/* Quiz Header */}
                            <div
                                className="flex items-center gap-3 p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() =>
                                    setExpandedQuizId(
                                        expandedQuizId === quiz.id ? null : quiz.id
                                    )
                                }
                            >
                                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                    <IconGripVertical className="size-5" />
                                </div>
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${quiz.questions.length > 0
                                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <IconQuestionMark className="size-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {editingQuizId === quiz.id ? (
                                        <Input
                                            value={quizFormData.title || quiz.title}
                                            onChange={(e) =>
                                                setQuizFormData({ ...quizFormData, title: e.target.value })
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8 max-w-xs"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <h3 className="font-medium truncate">{quiz.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{quiz.questions.length} questions</span>
                                                <span className="flex items-center gap-1">
                                                    <IconClock className="size-3" />
                                                    {quiz.timeLimit} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IconTarget className="size-3" />
                                                    {quiz.passingScore}% to pass
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => {
                                            setEditingQuizId(editingQuizId === quiz.id ? null : quiz.id);
                                            setQuizFormData(quiz);
                                        }}
                                    >
                                        <IconPencil className="size-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        {expandedQuizId === quiz.id ? (
                                            <IconChevronUp className="size-4" />
                                        ) : (
                                            <IconChevronDown className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveQuiz(quiz.id)}
                                    >
                                        <IconTrash className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Quiz Content */}
                            {expandedQuizId === quiz.id && (
                                <div className="p-4 space-y-4">
                                    {/* Quiz Settings */}
                                    <div className="grid gap-4 md:grid-cols-3 p-4 bg-muted/20 rounded-lg">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Time Limit (minutes)</Label>
                                            <Input
                                                type="number"
                                                value={quiz.timeLimit}
                                                onChange={(e) =>
                                                    handleUpdateQuiz(quiz.id, {
                                                        timeLimit: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Passing Score (%)</Label>
                                            <Input
                                                type="number"
                                                value={quiz.passingScore}
                                                onChange={(e) =>
                                                    handleUpdateQuiz(quiz.id, {
                                                        passingScore: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                                className="h-9"
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm">Module</Label>
                                            <Select
                                                value={quiz.moduleId || "none"}
                                                onValueChange={(value) =>
                                                    handleUpdateQuiz(quiz.id, {
                                                        moduleId: value === "none" ? null : value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select module" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No module</SelectItem>
                                                    {formData.modules.map((module) => (
                                                        <SelectItem key={module.id} value={module.id}>
                                                            {module.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Questions List */}
                                    {quiz.questions.length > 0 ? (
                                        <div className="space-y-3">
                                            {quiz.questions.map((question, qIndex) => (
                                                <div
                                                    key={question.id}
                                                    className="border rounded-lg overflow-hidden"
                                                >
                                                    {editingQuestionId === question.id ? (
                                                        // Edit Question Mode
                                                        <div className="p-4 space-y-4 bg-muted/10">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="secondary">Q{qIndex + 1}</Badge>
                                                                <Select
                                                                    value={question.type}
                                                                    onValueChange={(value: "multiple-choice" | "true-false") =>
                                                                        handleUpdateQuestion(quiz.id, question.id, {
                                                                            type: value,
                                                                            options:
                                                                                value === "true-false"
                                                                                    ? ["True", "False"]
                                                                                    : ["", "", "", ""],
                                                                            correctAnswer: 0,
                                                                        })
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-40 h-8">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {QUESTION_TYPES.map((type) => (
                                                                            <SelectItem key={type.value} value={type.value}>
                                                                                {type.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <div className="flex items-center gap-2 ml-auto">
                                                                    <Label className="text-xs">Points:</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={question.points}
                                                                        onChange={(e) =>
                                                                            handleUpdateQuestion(quiz.id, question.id, {
                                                                                points: parseInt(e.target.value) || 1,
                                                                            })
                                                                        }
                                                                        className="w-16 h-8"
                                                                        min={1}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <Textarea
                                                                placeholder="Enter your question..."
                                                                value={question.question}
                                                                onChange={(e) =>
                                                                    handleUpdateQuestion(quiz.id, question.id, {
                                                                        question: e.target.value,
                                                                    })
                                                                }
                                                                rows={2}
                                                                className="resizeअक"
                                                            />

                                                            {question.type === "multiple-choice" && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm">Answer Options</Label>
                                                                    {question.options.map((option, optIndex) => (
                                                                        <div
                                                                            key={optIndex}
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <Button
                                                                                variant={
                                                                                    question.correctAnswer === optIndex
                                                                                        ? "default"
                                                                                        : "outline"
                                                                                }
                                                                                size="icon"
                                                                                className="size-8 shrink-0"
                                                                                onClick={() =>
                                                                                    handleUpdateQuestion(quiz.id, question.id, {
                                                                                        correctAnswer: optIndex,
                                                                                    })
                                                                                }
                                                                            >
                                                                                {question.correctAnswer === optIndex ? (
                                                                                    <IconCircleCheck className="size-4" />
                                                                                ) : (
                                                                                    <IconCircleX className="size-4" />
                                                                                )}
                                                                            </Button>
                                                                            <Input
                                                                                value={option}
                                                                                onChange={(e) => {
                                                                                    const newOptions = [...question.options];
                                                                                    newOptions[optIndex] = e.target.value;
                                                                                    handleUpdateQuestion(quiz.id, question.id, {
                                                                                        options: newOptions,
                                                                                    });
                                                                                }}
                                                                                placeholder={`Option ${optIndex + 1}`}
                                                                                className="h-9"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Click the icon to mark the correct answer
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {question.type === "true-false" && (
                                                                <div className="flex items-center gap-4">
                                                                    <Label className="text-sm">Correct Answer:</Label>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant={
                                                                                question.correctAnswer === 0
                                                                                    ? "default"
                                                                                    : "outline"
                                                                            }
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleUpdateQuestion(quiz.id, question.id, {
                                                                                    correctAnswer: 0,
                                                                                })
                                                                            }
                                                                        >
                                                                            True
                                                                        </Button>
                                                                        <Button
                                                                            variant={
                                                                                question.correctAnswer === 1
                                                                                    ? "default"
                                                                                    : "outline"
                                                                            }
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleUpdateQuestion(quiz.id, question.id, {
                                                                                    correctAnswer: 1,
                                                                                })
                                                                            }
                                                                        >
                                                                            False
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setEditingQuestionId(null)}
                                                                >
                                                                    Done
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // View Question Mode
                                                        <div
                                                            className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                                                            onClick={() => setEditingQuestionId(question.id)}
                                                        >
                                                            <Badge variant="secondary" className="shrink-0 mt-1">
                                                                Q{qIndex + 1}
                                                            </Badge>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm">
                                                                    {question.question || "Untitled Question"}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {question.type === "multiple-choice"
                                                                            ? "Multiple Choice"
                                                                            : "True/False"}
                                                                    </Badge>
                                                                    <span>{question.points} point(s)</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-7"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingQuestionId(question.id);
                                                                    }}
                                                                >
                                                                    <IconPencil className="size-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-7 text-destructive hover:text-destructive"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveQuestion(quiz.id, question.id);
                                                                    }}
                                                                >
                                                                    <IconTrash className="size-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <IconAlertCircle className="size-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No questions added yet</p>
                                        </div>
                                    )}

                                    {/* Add Question Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => handleAddQuestion(quiz.id)}
                                    >
                                        <IconPlus className="size-4 mr-2" />
                                        Add Question
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {formData.quizzes.length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 text-sm">
                    <div className="flex items-center gap-2">
                        <IconQuestionMark className="size-4 text-amber-500" />
                        <span>{formData.quizzes.length} Quizzes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconListCheck className="size-4 text-blue-500" />
                        <span>
                            {formData.quizzes.reduce((acc, q) => acc + q.questions.length, 0)}{" "}
                            Questions
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconTarget className="size-4 text-green-500" />
                        <span>
                            {formData.quizzes.reduce(
                                (acc, q) =>
                                    acc + q.questions.reduce((pAcc, ques) => pAcc + ques.points, 0),
                                0
                            )}{" "}
                            Total Points
                        </span>
                    </div>
                </div>
            )}

            {/* AI Quiz Generation Dialog */}
            <AlertDialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <IconSparkles className="size-5 text-primary" />
                            Generate Quizzes with AI
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Let AI create quizzes based on your course content. The generated
                            quizzes will be added to your existing quizzes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Generate for</Label>
                            <Select
                                value={aiQuizModuleId}
                                onValueChange={setAiQuizModuleId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All course content</SelectItem>
                                    {formData.modules.map((module) => (
                                        <SelectItem key={module.id} value={module.id}>
                                            {module.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {aiQuizModuleId === "all"
                                    ? "Generate quizzes covering all modules"
                                    : `Generate a quiz for "${formData.modules.find(
                                          (m) => m.id === aiQuizModuleId
                                      )?.title}"`}
                            </p>
                        </div>

                        {aiQuizModuleId === "all" && (
                            <div className="space-y-2">
                                <Label>Number of Quizzes</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={aiNumQuizzes}
                                    onChange={(e) =>
                                        setAiNumQuizzes(parseInt(e.target.value) || 1)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Generate 1-10 quizzes (recommended: 1 per module)
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Questions per Quiz</Label>
                            <Input
                                type="number"
                                min={1}
                                max={20}
                                value={aiQuestionsPerQuiz}
                                onChange={(e) =>
                                    setAiQuestionsPerQuiz(parseInt(e.target.value) || 5)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Generate 1-20 questions per quiz (recommended: 5-10)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Include Video Transcripts</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIncludeTranscripts(!includeTranscripts)}
                                    className={`h-6 ${includeTranscripts ? "bg-primary text-primary-foreground" : ""}`}
                                >
                                    {includeTranscripts ? "Enabled" : "Disabled"}
                                </Button>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                {includeTranscripts ? (
                                    <>
                                        <IconCircleCheck className="size-3 text-green-500 mt-0.5" />
                                        <span>
                                            AI will analyze YouTube video transcripts to create more relevant questions.
                                            {formData.modules.some(m => m.lessons?.some(l => l.type === "video" && l.videoUrl)) && (
                                                <span className="block mt-1">
                                                    Found {formData.modules.reduce((acc, m) => acc + (m.lessons?.filter(l => l.type === "video" && l.videoUrl).length || 0), 0)} video(s) in this course.
                                                </span>
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <IconCircleX className="size-3 text-amber-500 mt-0.5" />
                                        <span>AI will only use course titles, descriptions, and learning objectives</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <Card className="bg-muted/50">
                            <CardContent className="p-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <IconSparkles className="size-4 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-medium">AI Quiz Generation</p>
                                        <p className="text-muted-foreground text-xs">
                                            Uses Meta's Llama 3 model via OpenRouter to generate
                                            relevant multiple-choice and true/false questions.
                                            {includeTranscripts && (
                                                <span className="block mt-1">
                                                    Video transcripts are automatically summarized to fit context limits while preserving key concepts.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {generationMetadata && (
                            <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                <CardContent className="p-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <IconCircleCheck className="size-4 text-green-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-medium text-green-800 dark:text-green-200">Transcript Processing Complete</p>
                                            <div className="grid grid-cols-3 gap-2 text-xs text-green-700 dark:text-green-300">
                                                <div className="text-center">
                                                    <p className="font-semibold">{generationMetadata.totalVideos}</p>
                                                    <p className="text-muted-foreground">Total Videos</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold">{generationMetadata.processedVideos}</p>
                                                    <p className="text-muted-foreground">Processed</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold">{generationMetadata.skippedVideos || 0}</p>
                                                    <p className="text-muted-foreground">Skipped</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {generateQuizzesMutation.isPending && (
                            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                <CardContent className="p-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <IconLoader2 className="size-5 text-blue-600 animate-spin" />
                                        <div className="flex-1">
                                            <p className="font-medium text-blue-800 dark:text-blue-200">
                                                {generationStep || "Generating quizzes..."}
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                                    <IconSparkles className="size-3" />
                                                    <span>This may take 1-2 minutes depending on video content</span>
                                                </div>
                                                {includeTranscripts && (
                                                    <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                                        <IconBook className="size-3" />
                                                        <span>Fetching transcripts → Summarizing → Extracting concepts → Generating questions</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAiGenerateQuizzes}
                            disabled={generateQuizzesMutation.isPending}
                            className="gap-2 bg-primary hover:bg-primary/90"
                        >
                            {generateQuizzesMutation.isPending ? (
                                <>
                                    <IconLoader2 className="size-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <IconSparkles className="size-4" />
                                    Generate Quizzes
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}