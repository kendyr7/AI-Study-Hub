import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { BookOpen, TestTube, Lightbulb, Bot, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className='bg-white text-black hover:bg-gray-200 hover:shadow-none'>
            <Link href="/signup">Get Started <ArrowRight className="ml-2" /></Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20 md:py-28">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm mb-6 border border-white/10">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Powered by Gemini
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Your Learning with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            AI Study Hub automatically creates summaries, flashcards, and tests from any text. Focus on what matters most: learning.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Start Learning for Free</Link>
          </Button>
        </section>

        <section id="features" className="py-16 sm:py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">A Smarter Way to Study</h2>
              <p className="text-lg text-muted-foreground mt-3">All the tools you need, powered by intelligence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Bot className="w-10 h-10" />}
                title="AI Summarization"
                description="Instantly get key concepts from long texts with AI-powered summaries."
              />
              <FeatureCard
                icon={<BookOpen className="w-10 h-10" />}
                title="Flashcard Generation"
                description="Automatically create smart flashcards to reinforce your knowledge."
              />
              <FeatureCard
                icon={<TestTube className="w-10 h-10" />}
                title="Dynamic Tests"
                description="Generate practice tests to check your understanding and prepare for exams."
              />
              <FeatureCard
                icon={<Lightbulb className="w-10 h-10" />}
                title="Intelligent Review"
                description="Our AI identifies your weak spots and creates targeted review sessions."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Study Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center transition-transform duration-300 hover:-translate-y-2">
      <CardHeader>
        <div className="mx-auto bg-gradient-to-br from-primary/20 to-accent/20 text-primary p-5 rounded-xl w-fit">
          {icon}
        </div>
        <CardTitle className="mt-6 font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}