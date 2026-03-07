/**
 * Course Quiz Page
 * Interactive quiz interface for course assessments
 * Features: Multiple choice questions, progress tracking, instant feedback, results summary
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconX,
  IconClock,
  IconAward,
  IconTrophy,
  IconRefresh,
  IconAlertCircle,
  IconBook,
  IconFlame,
  IconStar,
  IconLoader2,
} from "@tabler/icons-react";
import { useMyEnrollments, useStartQuiz, useSubmitQuiz } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points?: number;
}

interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number; // in minutes
}

interface Module {
  id?: string;
  title: string;
  quizzes?: Quiz[];
}

interface Course {
  _id: string;
  title: string;
  modules: Module[];
  hasCertificate?: boolean;
}

interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: "active" | "completed" | "dropped";
}

interface QuizAttempt {
  answers: (number | null)[];
  score: number;
  completed: boolean;
}

export function CourseQuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();

  // Fetch enrollments
  const { data: enrollmentsData } = useMyEnrollments({ limit: 100 });
  const enrollment = enrollmentsData?.enrollments?.find(
    (e) => e.course._id === courseId
  ) as Enrollment | undefined;

  // Quiz mutations
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();

  // Find the quiz
  const course = enrollment?.course;
  // Get quizzes from modules first, then fall back to course-level quizzes
  const moduleQuizzes = course?.modules?.flatMap((m) => m.quizzes || []) || [];
  const courseQuizzes = (course as any)?.quizzes || [];
  const allQuizzes = moduleQuizzes.length > 0 ? moduleQuizzes : courseQuizzes;
  const quiz = allQuizzes.find((q) => q._id === quizId || q.title === quizId || q._id?.toString() === quizId);

  // Debug logging
  useEffect(() => {
    console.log("Quiz Page Debug:", {
      courseId,
      quizId,
      hasCourse: !!course,
      moduleQuizzesCount: moduleQuizzes.length,
      courseQuizzesCount: courseQuizzes.length,
      allQuizzesCount: allQuizzes.length,
      foundQuiz: !!quiz,
      quizTitle: quiz?.title,
    });
  }, [courseId, quizId, course, moduleQuizzes.length, courseQuizzes.length, allQuizzes.length, quiz]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initialize quiz
  useEffect(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(null));
      setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
    }
  }, [quiz]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && timeRemaining > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeRemaining, showResults]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Handle answer selection
  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Navigate questions
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!quiz || !attemptId) return;

    try {
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

      const formattedAnswers = answers.map((answer) => ({
        selectedAnswer: answer !== null ? answer : 0,
      }));

      const result = await submitQuizMutation.mutateAsync({
        attemptId,
        data: {
          answers: formattedAnswers,
          timeSpent,
        },
      });

      if (result.data) {
        setShowResults(true);
        toast.success(
          result.data.passed
            ? "Quiz passed! Great job!"
            : "Quiz submitted. Review your answers and try again if needed."
        );
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit quiz. Please try again."
      );
    }
  };

  // Calculate results
  const calculateScore = () => {
    if (!quiz) return { score: 0, percentage: 0, passed: false, correctCount: 0 };

    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passingScore = quiz.passingScore || 70;

    return {
      score: correctCount,
      percentage,
      passed: percentage >= passingScore,
      correctCount,
    };
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Start quiz
  const handleStartQuiz = async () => {
    if (!quiz || !enrollment) return;

    try {
      const result = await startQuizMutation.mutateAsync({
        quizId: quiz._id || quizId!,
        courseId: courseId!,
        enrollmentId: enrollment._id,
      });

      if (result.data) {
        setAttemptId(result.data.attemptId);
        setStartTime(Date.now());
        setQuizStarted(true);
        setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
      }
    } catch (error) {
      console.error("Failed to start quiz:", error);
      toast.error("Failed to start quiz. Please try again.");
    }
  };

  // Restart quiz
  const handleRestartQuiz = () => {
    if (!quiz) return;
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setShowResults(false);
    setQuizStarted(false);
    setSelectedAnswer(null);
    setAttemptId(null);
    setStartTime(null);
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
  };

  // Loading state
  if (!enrollment || !course || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const results = calculateScore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/learn/${courseId}`)}>
                <IconArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-sm">{quiz.title}</h1>
                <p className="text-xs text-muted-foreground">{course.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {quizStarted && !showResults && (
                <div className="flex items-center gap-2">
                  <IconClock className={cn(
                    "size-4",
                    timeRemaining < 60 ? "text-red-500" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-mono",
                    timeRemaining < 60 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl px-4 py-8">
        {!quizStarted ? (
          // Quiz Introduction
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <IconAward className="size-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <CardDescription className="text-base">
                {quiz.description || "Test your knowledge of what you've learned"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                  <div className="text-xs text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{quiz.timeLimit || "∞"}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-amber-500">{quiz.passingScore || 70}%</div>
                  <div className="text-xs text-muted-foreground">To Pass</div>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <IconAlertCircle className="size-4" />
                <AlertDescription>
                  <ul className="text-sm space-y-1 mt-2">
                    <li>• Read each question carefully before selecting your answer</li>
                    <li>• You can navigate between questions using Previous/Next</li>
                    <li>• Submit when you're ready to see your results</li>
                    {quiz.timeLimit && (
                      <li>• Complete the quiz within the time limit</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                className="w-full"
                size="lg"
                onClick={handleStartQuiz}
                disabled={startQuizMutation.isPending}
              >
                {startQuizMutation.isPending ? (
                  <>
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <IconAward className="size-4 mr-2" />
                    Start Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : showResults ? (
          // Quiz Results
          <div className="space-y-6">
            {/* Results Card */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
                  results.passed ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  {results.passed ? (
                    <IconTrophy className="size-12 text-green-500" />
                  ) : (
                    <IconRefresh className="size-12 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {results.passed ? "🎉 Congratulations!" : "Keep Practicing!"}
                </CardTitle>
                <CardDescription>
                  {results.passed
                    ? "You've successfully passed the quiz"
                    : "Review the material and try again"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{results.percentage}%</div>
                  <div className="text-muted-foreground">
                    {results.correctCount} out of {totalQuestions} correct
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Your Score</span>
                    <span className={cn(
                      "font-medium",
                      results.passed ? "text-green-500" : "text-red-500"
                    )}>
                      {results.percentage}%
                    </span>
                  </div>
                  <Progress value={results.percentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Passing: {quiz.passingScore || 70}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleRestartQuiz}>
                    <IconRefresh className="size-4 mr-2" />
                    Retry Quiz
                  </Button>
                  <Button className="flex-1" onClick={() => navigate(`/learn/${courseId}`)}>
                    <IconBook className="size-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Review Answers</CardTitle>
                <CardDescription>See which questions you got right or wrong</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;

                  return (
                    <div
                      key={question._id || index}
                      className={cn(
                        "p-4 rounded-lg border",
                        isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        )}>
                          {isCorrect ? (
                            <IconCheck className="size-4 text-white" />
                          ) : (
                            <IconX className="size-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-2">{question.question}</p>
                          <div className="space-y-1 text-sm">
                            <div className={cn(
                              "flex items-center gap-2",
                              isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              <span>Your answer:</span>
                              <span className="font-medium">
                                {userAnswer !== null ? question.options[userAnswer] : "Not answered"}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <span>Correct answer:</span>
                                <span className="font-medium">
                                  {question.options[question.correctAnswer]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Quiz Questions
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                  {currentQuestion?.points && (
                    <Badge variant="secondary">
                      <IconStar className="size-3 mr-1" />
                      {currentQuestion.points} points
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion?.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleSelectAnswer(optionIndex)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      selectedAnswer === optionIndex
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedAnswer === optionIndex
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}>
                        {selectedAnswer === optionIndex && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <IconArrowLeft className="size-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={submitQuizMutation.isPending}
                  >
                    {submitQuizMutation.isPending ? (
                      <>
                        <IconLoader2 className="size-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <IconCheck className="size-4 mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={submitQuizMutation.isPending}>
                    Next
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Navigator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setSelectedAnswer(answers[index]);
                      }}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                        index === currentQuestionIndex
                          ? "bg-primary text-primary-foreground"
                          : answers[index] !== null
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                            : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-primary flex items-center justify-center" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-500/10 border border-green-500/30 flex items-center justify-center" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-muted flex items-center justify-center" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
