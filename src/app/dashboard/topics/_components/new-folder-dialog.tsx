'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createFolderAction } from '@/app/actions';
import type { Folder } from '@/lib/types';

interface NewFolderDialogProps {
  onFolderCreated: (newFolder: Folder) => void;
  children?: React.ReactNode;
}

export function NewFolderDialog({ onFolderCreated, children }: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Folder name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await createFolderAction({ name, userId: 'user-123' }); // Placeholder userId

    if (result.success && result.folder) {
      toast({ title: 'Folder Created', description: `Folder "${result.folder.name}" has been created.` });
      onFolderCreated(result.folder);
      setOpen(false);
      setName('');
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to create folder.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Give your new folder a name. You can drag and drop topics into it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Q2 Exam Prep"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateFolder} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
