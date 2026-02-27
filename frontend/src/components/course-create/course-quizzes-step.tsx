/**
 * Course Quizzes Step
 * Third step - create and manage quizzes for the course
 */

import { useState } from "react";
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
} from "@tabler/icons-react";
import type { CourseFormData, Quiz, QuizQuestion } from "@/pages/course-create-page";

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

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
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

            {/* Add Quiz Button */}
            <Button onClick={handleAddQuiz} className="gap-2">
                <IconPlus className="size-4" />
                Create Quiz
            </Button>

            {/* Quizzes List */}
            {formData.quizzes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
                    <IconQuestionMark className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No quizzes yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Create quizzes to assess student understanding
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Quizzes help reinforce learning and track progress
                    </p>
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
        </div>
    );
}