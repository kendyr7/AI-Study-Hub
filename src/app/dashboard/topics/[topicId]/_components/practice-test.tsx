'use client';

import { useState } from 'react';
import type { TestQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PracticeTest({ questions }: { questions: TestQuestion[] }) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionId: string, value: string) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.answer) {
                correctAnswers++;
            }
        });
        setScore((correctAnswers / questions.length) * 100);
        setSubmitted(true);
    };
    
    const handleRetake = () => {
        setAnswers({});
        setScore(0);
        setSubmitted(false);
    }

    if (submitted) {
        return (
            <div className="space-y-6">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{score.toFixed(0)}%</p>
                        <p className="text-muted-foreground">You answered {Math.round(score/100 * questions.length)} out of {questions.length} questions correctly.</p>
                        <Button onClick={handleRetake} className="mt-6">
                            <Rocket className="mr-2 h-4 w-4" />
                            Retake Test
                        </Button>
                    </CardContent>
                </Card>
                
                <h3 className="text-lg font-semibold">Review your answers:</h3>

                <div className="space-y-4">
                    {questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.answer;
                        return (
                            <div key={q.id} className={cn("p-4 rounded-lg border", isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10')}>
                                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                <div className="text-sm">
                                    <p className={cn("flex items-center", !isCorrect && "text-red-700 dark:text-red-400")}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Your answer: {userAnswer || "No answer"}
                                    </p>
                                    <p className="flex items-center text-green-700 dark:text-green-400 mt-1">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Correct answer: {q.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {questions.map((q, index) => (
                <div key={q.id}>
                    <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                    <RadioGroup
                        onValueChange={(value) => handleAnswerChange(q.id, value)}
                        value={answers[q.id]}
                        disabled={submitted}
                    >
                        {q.type === 'multiple_choice' && q.options?.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                                <Label htmlFor={`${q.id}-${i}`}>{option}</Label>
                            </div>
                        ))}
                        {q.type === 'true_false' && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id={`${q.id}-true`} />
                                    <Label htmlFor={`${q.id}-true`}>True</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id={`${q.id}-false`} />
                                    <Label htmlFor={`${q.id}-false`}>False</Label>
                                </div>
                            </>
                        )}
                    </RadioGroup>
                </div>
            ))}
            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
                    Submit Test
                </Button>
            </div>
        </div>
    );
}
