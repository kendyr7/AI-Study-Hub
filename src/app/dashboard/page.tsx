import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Lightbulb, BookCopy, TestTube, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your study progress.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/topics/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Topic
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Topics Created" 
          value="12" 
          icon={<BookCopy className="h-6 w-6 text-muted-foreground" />} 
        />
        <StatCard 
          title="Flashcards Studied" 
          value="256" 
          icon={<Lightbulb className="h-6 w-6 text-muted-foreground" />} 
        />
        <StatCard 
          title="Avg. Test Score" 
          value="88%" 
          icon={<TestTube className="h-6 w-6 text-muted-foreground" />} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Topics</CardTitle>
            <CardDescription>Jump back into your recent study materials.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTopicsTable />
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-primary" />
              <CardTitle className="font-headline text-primary">Intelligent Review</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Our AI has identified topics you could improve on. Start a review session to strengthen your knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Cellular Biology</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Quantum Mechanics</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="default">
              <Link href="/dashboard/review">Start Review Session</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function RecentTopicsTable() {
    const topics = [
        { name: "The History of Ancient Rome", tags: ["History", "Europe"], lastStudied: "2 hours ago" },
        { name: "Introduction to React Hooks", tags: ["Programming", "Web Dev"], lastStudied: "1 day ago" },
        { name: "The Mitochondrion", tags: ["Biology", "Science"], lastStudied: "3 days ago" },
        { name: "Principles of Macroeconomics", tags: ["Economics"], lastStudied: "5 days ago" },
    ];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Last Studied</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((topic) => (
            <TableRow key={topic.name}>
                <TableCell className="font-medium">
                    <Link href="#" className="hover:underline">{topic.name}</Link>
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        {topic.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{topic.lastStudied}</TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
