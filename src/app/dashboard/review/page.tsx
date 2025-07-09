import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default function ReviewPage() {
  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Intelligent Review</h1>
          <p className="text-muted-foreground">
            Let our AI help you focus on the topics you need to improve.
          </p>
        </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary" />
            <CardTitle>Start a Review Session</CardTitle>
          </div>
          <CardDescription className="pt-2">
            We will generate flashcards and test questions based on topics where your performance has been the lowest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full">
            Begin Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
