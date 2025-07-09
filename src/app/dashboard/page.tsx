import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Lightbulb, BookCopy, TestTube, ArrowRight } from "lucide-react";
import { adminDb } from "@/lib/firebase";
import type { Topic } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

async function getDashboardData(userId: string) {
    const topicsRef = adminDb.collection('topics').where('userId', '==', userId);
    
    const totalTopicsPromise = topicsRef.count().get();
    
    const recentTopicsPromise = topicsRef
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

    const [totalTopicsSnapshot, recentTopicsSnapshot] = await Promise.all([
        totalTopicsPromise,
        recentTopicsPromise,
    ]);

    const totalTopics = totalTopicsSnapshot.data().count;
    const recentTopics = recentTopicsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          lastStudiedAt: data.lastStudiedAt ? data.lastStudiedAt.toDate() : undefined,
        } as Topic;
    });

    // Placeholder data for now
    const flashcardsStudied = 0;
    const avgTestScore = 'N/A';
    const weakTopics = ["Cellular Biology", "Quantum Mechanics"]; // This will come from intelligent review later

    return { totalTopics, flashcardsStudied, avgTestScore, recentTopics, weakTopics };
}


export default async function DashboardPage() {
  const userId = 'user-123'; // Placeholder
  const { totalTopics, flashcardsStudied, avgTestScore, recentTopics, weakTopics } = await getDashboardData(userId);

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
          value={totalTopics.toString()}
          icon={<BookCopy className="h-6 w-6 text-muted-foreground" />} 
        />
        <StatCard 
          title="Flashcards Studied" 
          value={flashcardsStudied.toString()} 
          icon={<Lightbulb className="h-6 w-6 text-muted-foreground" />} 
        />
        <StatCard 
          title="Avg. Test Score" 
          value={avgTestScore}
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
            <RecentTopicsTable topics={recentTopics} />
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
            {weakTopics.length > 0 ? (
                <>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                    {weakTopics.map(topic => (
                        <li key={topic} className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <span>{topic}</span>
                        </li>
                    ))}
                    </ul>
                    <Button className="w-full mt-6" variant="default" asChild>
                        <Link href="/dashboard/review">Start Review Session</Link>
                    </Button>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">Study some topics and take some tests to get personalized review sessions!</p>
            )}
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

function RecentTopicsTable({ topics }: { topics: Topic[] }) {
    if (topics.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No recent topics found.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/topics/new">Create a Topic</Link>
                </Button>
            </div>
        )
    }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((topic) => (
            <TableRow key={topic.id}>
                <TableCell className="font-medium">
                    <Link href="#" className="hover:underline">{topic.title}</Link>
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        {topic.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
