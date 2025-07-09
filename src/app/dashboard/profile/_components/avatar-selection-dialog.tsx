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
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const avatars = [
  { id: 'avatar1', url: 'https://placehold.co/100x100/7F9CF5/FFFFFF.png', hint: 'blue avatar' },
  { id: 'avatar2', url: 'https://placehold.co/100x100/FBBF24/FFFFFF.png', hint: 'yellow avatar' },
  { id: 'avatar3', url: 'https://placehold.co/100x100/A78BFA/FFFFFF.png', hint: 'purple avatar' },
  { id: 'avatar4', url: 'https://placehold.co/100x100/F87171/FFFFFF.png', hint: 'red avatar' },
  { id: 'avatar5', url: 'https://placehold.co/100x100/34D399/FFFFFF.png', hint: 'green avatar' },
  { id: 'avatar6', url: 'https://placehold.co/100x100/60A5FA/FFFFFF.png', hint: 'sky avatar' },
];

interface AvatarSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string | null;
  onSelect: (url: string) => void;
  isSaving: boolean;
}

export function AvatarSelectionDialog({
  open,
  onOpenChange,
  currentAvatar,
  onSelect,
  isSaving,
}: AvatarSelectionDialogProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleSave = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
          <DialogDescription>
            Select a new avatar from the options below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.url)}
              className={cn(
                'rounded-full p-1 transition-all',
                selectedAvatar === avatar.url
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'hover:bg-accent'
              )}
              disabled={isSaving}
            >
              <Avatar className="h-24 w-24">
                <Image
                  src={avatar.url}
                  alt={`Avatar ${avatar.id}`}
                  width={100}
                  height={100}
                  data-ai-hint={avatar.hint}
                />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedAvatar || selectedAvatar === currentAvatar}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
