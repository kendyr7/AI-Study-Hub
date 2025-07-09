
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function TopicsPage() {
    const topics = [
        { name: "The History of Ancient Rome", tags: ["History", "Europe"], lastStudied: "2 hours ago" },
        { name: "Introduction to React Hooks", tags: ["Programming", "Web Dev"], lastStudied: "1 day ago" },
        { name: "The Mitochondrion", tags: ["Biology", "Science"], lastStudied: "3 days ago" },
        { name: "Principles of Macroeconomics", tags: ["Economics"], lastStudied: "5 days ago" },
        { name: "The Solar System", tags: ["Astronomy", "Science"], lastStudied: "1 week ago" },
        { name: "Shakespeare's Sonnets", tags: ["Literature", "Poetry"], lastStudied: "2 weeks ago" },
    ];

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
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Last Studied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell className="text-muted-foreground">{topic.lastStudied}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="#">Study</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
