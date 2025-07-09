import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { BookOpen, TestTube, Lightbulb, Bot } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
            Supercharge Your Learning with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            AI Study Hub automatically creates summaries, flashcards, and tests from any text. Focus on what matters most: learning.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Start Learning for Free</Link>
          </Button>
        </section>

        <section id="features" className="bg-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">A Smarter Way to Study</h2>
              <p className="text-lg text-muted-foreground mt-2">All the tools you need, powered by intelligence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Bot className="w-8 h-8" />}
                title="AI Summarization"
                description="Instantly get key concepts from long texts with AI-powered summaries."
              />
              <FeatureCard
                icon={<BookOpen className="w-8 h-8" />}
                title="Flashcard Generation"
                description="Automatically create smart flashcards to reinforce your knowledge."
              />
              <FeatureCard
                icon={<TestTube className="w-8 h-8" />}
                title="Dynamic Tests"
                description="Generate practice tests to check your understanding and prepare for exams."
              />
              <FeatureCard
                icon={<Lightbulb className="w-8 h-8" />}
                title="Intelligent Review"
                description="Our AI identifies your weak spots and creates targeted review sessions."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Study Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
