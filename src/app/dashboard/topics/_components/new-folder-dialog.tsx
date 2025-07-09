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
import { FolderPlus, Loader2, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createFolderAction } from '@/app/actions';
import type { Folder } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { useTheme } from '@/components/theme-provider';

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];


interface NewFolderDialogProps {
  onFolderCreated: (newFolder: Folder) => void;
  children?: React.ReactNode;
}

export function NewFolderDialog({ onFolderCreated, children }: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleCreateFolder = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Folder name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await createFolderAction({ name, userId: 'user-123', color, emoji }); // Placeholder userId

    if (result.success && result.folder) {
      toast({ title: 'Folder Created', description: `Folder "${result.folder.name}" has been created.` });
      onFolderCreated(result.folder);
      setOpen(false);
      setName('');
      setEmoji(undefined);
      setColor(undefined);
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to create folder.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setName('');
            setEmoji(undefined);
            setColor(undefined);
        }
    }}>
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
            Give your new folder a name and optionally pick a color and emoji.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0" disabled={isLoading}>
                            {emoji ? <span className="text-xl">{emoji}</span> : <Smile className="h-4 w-4" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => setEmoji(emojiData.emoji)}
                          theme={theme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                        />
                    </PopoverContent>
                </Popover>
                <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q2 Exam Prep"
                disabled={isLoading}
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Color
            </Label>
             <div className="col-span-3 flex flex-wrap gap-2">
                {colors.map(c => (
                    <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        disabled={isLoading}
                    />
                ))}
             </div>
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
