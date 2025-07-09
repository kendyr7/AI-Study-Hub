'use client';

import { useState, useMemo } from 'react';
import type { TestQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Rocket, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnswerResult {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    options?: string[];
    type: 'multiple_choice' | 'true_false';
}

export function PracticeTest({ questions }: { questions: TestQuestion[] }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
    const [results, setResults] = useState<AnswerResult[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const handleSelectOption = (value: string) => {
        if (answerStatus !== 'unanswered') return;
        setSelectedOption(value);
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;

        const isCorrect = selectedOption === currentQuestion.answer;
        setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
        setResults(prev => [...prev, {
            question: currentQuestion.question,
            userAnswer: selectedOption,
            correctAnswer: currentQuestion.answer,
            isCorrect,
            options: currentQuestion.options,
            type: currentQuestion.type,
        }]);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setAnswerStatus('unanswered');
        } else {
            setIsFinished(true);
        }
    };
    
    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setAnswerStatus('unanswered');
        setResults([]);
        setIsFinished(false);
    }

    if (isFinished) {
        const correctAnswers = results.filter(r => r.isCorrect).length;
        const score = (correctAnswers / questions.length) * 100;

        return (
            <div className="space-y-6">
                <Card className="text-center p-6">
                    <Trophy className={cn("h-16 w-16 mx-auto mb-4", score >= 80 ? 'text-yellow-400' : score >= 50 ? 'text-gray-400' : 'text-yellow-800')} />
                    <CardTitle className="text-3xl font-headline">Test Complete!</CardTitle>
                    <CardDescription className="text-lg mt-2">You scored</CardDescription>
                    <p className="text-5xl font-bold my-4 font-headline">{score.toFixed(0)}%</p>
                    <p className="text-muted-foreground">You answered {correctAnswers} out of {questions.length} questions correctly.</p>
                    <Button onClick={handleRetake} className="mt-6">
                        <Rocket className="mr-2 h-4 w-4" />
                        Retake Test
                    </Button>
                </Card>
                
                <h3 className="text-xl font-semibold font-headline">Review Your Answers</h3>

                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={index} className={cn("p-4 rounded-lg border", result.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10')}>
                            <p className="font-semibold mb-3">{index + 1}. {result.question}</p>
                            <div className="text-sm space-y-2">
                                <p className={cn("flex items-center gap-2", !result.isCorrect && "text-red-700 dark:text-red-400 font-medium")}>
                                    {result.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                                    Your answer: {result.userAnswer || "No answer"}
                                </p>
                                {!result.isCorrect && (
                                     <p className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                        <CheckCircle className="h-4 w-4" />
                                        Correct answer: {result.correctAnswer}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    const getOptionClass = (option: string) => {
        if (answerStatus === 'unanswered') return '';
        if (option === currentQuestion.answer) return 'bg-green-500/20 border-green-500 text-foreground';
        if (option === selectedOption && option !== currentQuestion.answer) return 'bg-red-500/20 border-red-500 text-foreground';
        return 'opacity-50';
    }
    
    const getRadioItemClass = (option: string) => {
        if (answerStatus === 'unanswered') return '';
        if (option === currentQuestion.answer) return 'border-green-500';
        if (option === selectedOption && option !== currentQuestion.answer) return 'border-red-500';
        return '';
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-primary">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        onValueChange={handleSelectOption}
                        value={selectedOption || ''}
                        disabled={answerStatus !== 'unanswered'}
                        className="space-y-3"
                    >
                        {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, i) => (
                            <Label 
                                key={i}
                                htmlFor={`${currentQuestion.id}-${i}`}
                                className={cn(
                                    "flex items-center space-x-3 p-4 border rounded-lg transition-all cursor-pointer",
                                    selectedOption === option && 'border-primary ring-2 ring-primary',
                                    answerStatus !== 'unanswered' && getOptionClass(option)
                                )}
                            >
                                <RadioGroupItem value={option} id={`${currentQuestion.id}-${i}`} className={cn(answerStatus !== 'unanswered' && getRadioItemClass(option))} />
                                <span>{option}</span>
                            </Label>
                        ))}
                        {currentQuestion.type === 'true_false' && (
                            <>
                                {["True", "False"].map((option, i) => (
                                     <Label 
                                        key={i}
                                        htmlFor={`${currentQuestion.id}-${option.toLowerCase()}`}
                                        className={cn(
                                            "flex items-center space-x-3 p-4 border rounded-lg transition-all cursor-pointer",
                                            selectedOption === option.toLowerCase() && 'border-primary ring-2 ring-primary',
                                            answerStatus !== 'unanswered' && getOptionClass(option.toLowerCase())
                                        )}
                                    >
                                        <RadioGroupItem value={option.toLowerCase()} id={`${currentQuestion.id}-${option.toLowerCase()}`} className={cn(answerStatus !== 'unanswered' && getRadioItemClass(option.toLowerCase()))}/>
                                        <span>{option}</span>
                                    </Label>
                                ))}
                            </>
                        )}
                    </RadioGroup>
                </CardContent>
            </Card>

             {answerStatus !== 'unanswered' && (
                <div className={cn(
                    "p-4 rounded-lg text-center font-semibold",
                    answerStatus === 'correct' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                )}>
                    {answerStatus === 'correct' ? "Correct!" : `The correct answer is: ${currentQuestion.answer}`}
                </div>
             )}

            <div className="flex justify-end">
                {answerStatus === 'unanswered' ? (
                     <Button onClick={handleCheckAnswer} disabled={!selectedOption}>
                        Check
                    </Button>
                ) : (
                    <Button onClick={handleNextQuestion}>
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                    </Button>
                )}
            </div>
        </div>
    );
}
