import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase";
import type { Topic } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

async function getTopics(userId: string): Promise<Topic[]> {
  if (!adminDb) {
    console.warn("Firebase Admin not initialized, topics list will be empty.");
    return [];
  }

  const topicsSnapshot = await adminDb.collection('topics')
    .where('userId', '==', userId)
    .get();
  
  if (topicsSnapshot.empty) {
    return [];
  }
  
  const topics = topicsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      // Firestore timestamps need to be converted to JS Dates
      createdAt: data.createdAt.toDate(),
      lastStudiedAt: data.lastStudiedAt ? data.lastStudiedAt.toDate() : undefined,
    } as Topic;
  });

  return topics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export default async function TopicsPage() {
    // In a real app, you'd get this from auth
    const userId = 'user-123';
    const topics = await getTopics(userId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Topics</h1>
          <p className="text-muted-foreground">Here are all the topics you've created.</p>
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

      <Card>
        <CardHeader>
            <CardTitle>All Topics</CardTitle>
            <CardDescription>Click on a topic to start studying.</CardDescription>
        </CardHeader>
        <CardContent>
            {topics.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topics.map((topic) => (
                            <TableRow key={topic.id}>
                                <TableCell className="font-medium">
                                    {/* This link will eventually go to /dashboard/topics/[topicId] */}
                                    <Link href="#" className="hover:underline">{topic.title}</Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {topic.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="#">Study</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">You haven't created any topics yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/topics/new">Create Your First Topic</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
