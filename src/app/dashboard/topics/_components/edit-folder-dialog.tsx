'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateFolderAction } from '@/app/actions';
import type { Folder } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const emojis = ['😀', '🚀', '💡', '📚', '✅', '🧠', '✍️', '🎉', '🌟', '⚙️', '🔥', '🏆'];
const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];


interface EditFolderDialogProps {
  folder: Folder;
  onFolderUpdated: (updatedFolder: Folder) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFolderDialog({ folder, onFolderUpdated, open, onOpenChange }: EditFolderDialogProps) {
  const [name, setName] = useState(folder.name);
  const [emoji, setEmoji] = useState<string | undefined>(folder.emoji);
  const [color, setColor] = useState<string | undefined>(folder.color);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(folder.name);
      setEmoji(folder.emoji);
      setColor(folder.color);
    }
  }, [open, folder]);


  const handleUpdateFolder = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Folder name cannot be empty.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await updateFolderAction({ folderId: folder.id, name, color, emoji });

    if (result.success && result.folder) {
      toast({ title: 'Folder Updated', description: `Folder "${result.folder.name}" has been updated.` });
      onFolderUpdated(result.folder);
      onOpenChange(false);
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to update folder.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Update your folder's name, color, and emoji.
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
                            {emoji ? <span>{emoji}</span> : <Smile className="h-4 w-4" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                            {emojis.map(e => (
                                <button key={e} onClick={() => setEmoji(e)} className="text-2xl rounded-md p-1 hover:bg-accent">{e}</button>
                            ))}
                        </div>
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" onClick={handleUpdateFolder} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
