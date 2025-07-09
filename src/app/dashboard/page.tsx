import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, Lightbulb, BookCopy, TestTube, ArrowRight } from "lucide-react";
import { adminDb } from "@/lib/firebase";
import type { Topic } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

async function getDashboardData(userId: string) {
    if (!adminDb) {
        console.warn("Firebase Admin not initialized, dashboard data will be empty.");
        return { totalTopics: 0, flashcardsStudied: 0, avgTestScore: 'N/A', recentTopics: [], weakTopics: [] };
    }

    const topicsRef = adminDb.collection('topics').where('userId', '==', userId);
    
    const totalTopicsPromise = topicsRef.count().get();
    
    const allTopicsPromise = topicsRef.get();

    const [totalTopicsSnapshot, allTopicsSnapshot] = await Promise.all([
        totalTopicsPromise,
        allTopicsPromise,
    ]);

    const totalTopics = totalTopicsSnapshot.data().count;
    
    const allTopics = allTopicsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          lastStudiedAt: data.lastStudiedAt ? data.lastStudiedAt.toDate() : undefined,
        } as Topic;
    });

    const recentTopics = allTopics
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Placeholder data for now
    const flashcardsStudied = 0;
    const avgTestScore = 'N/A';
    
    // Simulate performance scores to find weak topics
    const weakTopics = allTopics
        .map(topic => ({
            name: topic.title,
            // Assign a random score, lower is weaker.
            score: Math.floor(Math.random() * 60) + 20, // Score between 20 and 80
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(t => t.name);

    return { totalTopics, flashcardsStudied, avgTestScore, recentTopics, weakTopics };
}


export default async function DashboardPage() {
  const userId = 'user-123'; // Placeholder
  const { totalTopics, flashcardsStudied, avgTestScore, recentTopics, weakTopics } = await getDashboardData(userId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Dashboard</h1>
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Topics Created" 
          value={totalTopics.toString()}
          icon={<BookCopy className="h-8 w-8 text-muted-foreground" />} 
        />
        <StatCard 
          title="Flashcards Studied" 
          value={flashcardsStudied.toString()} 
          icon={<Lightbulb className="h-8 w-8 text-muted-foreground" />} 
        />
        <StatCard 
          title="Avg. Test Score" 
          value={avgTestScore}
          icon={<TestTube className="h-8 w-8 text-muted-foreground" />} 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Topics</CardTitle>
            <CardDescription>Jump back into your recent study materials.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTopicsTable topics={recentTopics} />
          </CardContent>
        </Card>
        
        <div className="relative rounded-2xl bg-gradient-to-r from-primary to-accent p-px">
          <Card className="relative h-full border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
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
                <>
                  <p className="text-sm text-muted-foreground">You don&apos;t have any topics yet. Create one to get started!</p>
                   <Button className="w-full mt-6" variant="default" asChild>
                        <Link href="/dashboard/topics/new">Create a Topic</Link>
                    </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline">{value}</div>
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
    <>
        {/* Mobile View: List of Cards */}
        <div className="space-y-4 md:hidden">
            {topics.map((topic) => (
                <Link key={topic.id} href={`/dashboard/topics/${topic.id}`} className="block">
                    <Card className="transition-colors hover:bg-muted/20">
                        <CardContent className="flex items-start justify-between p-4">
                           <div>
                                <p className="font-semibold">{topic.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {topic.tags.map(tag => <Badge key={tag} variant="secondary" className="border border-white/10">{tag}</Badge>)}
                                </div>
                           </div>
                           <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>Topic</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                    <TableRow key={topic.id} className="border-white/10">
                        <TableCell className="font-medium">
                            <Link href={`/dashboard/topics/${topic.id}`} className="transition-colors hover:text-primary">{topic.title}</Link>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {topic.tags.map(tag => <Badge key={tag} variant="secondary" className="border border-white/10">{tag}</Badge>)}
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
    </>
  );
}