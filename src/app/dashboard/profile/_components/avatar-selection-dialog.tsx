
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
    { 
        id: 'avatar1', 
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#95bde3"><circle cx="50" cy="50" r="50" fill-opacity="0.3"/><path d="M50,0 A50,50 0 0,1 100,50 L50,50 Z" /></g></svg>`,
        hint: 'abstract circle'
    },
    { 
        id: 'avatar2',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#a292ba"><rect width="100" height="100" fill-opacity="0.3"/><polygon points="0,0 100,0 50,100" /></g></svg>`,
        hint: 'abstract triangle'
    },
    { 
        id: 'avatar3',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#95bde3"><defs><pattern id="p3" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M0,0 h10 v10 h-10z" fill-opacity="0.5" /></pattern></defs><circle cx="50" cy="50" r="50" fill="url(#p3)" /></g></svg>`,
        hint: 'geometric pattern'
    },
    { 
        id: 'avatar4',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#a292ba"><rect x="10" y="10" width="80" height="80" rx="15" fill-opacity="0.4" /><rect x="25" y="25" width="50" height="50" rx="10" /></g></svg>`,
        hint: 'rounded squares'
    },
    { 
        id: 'avatar5',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#95bde3" stroke="#a292ba" stroke-width="2"><line x1="0" y1="0" x2="100" y2="100" /><line x1="100" y1="0" x2="0" y2="100" /></g></svg>`,
        hint: 'crossing lines'
    },
    { 
        id: 'avatar6',
        svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="#a292ba"><path d="M0,50 Q50,0 100,50 T0,50 Z" fill-opacity="0.7" /><path d="M0,50 Q50,100 100,50 T0,50 Z" fill-opacity="0.4" /></g></svg>`,
        hint: 'abstract waves'
    },
];

const toBase64 = (str: string) => typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);
const toDataUrl = (svg: string) => `data:image/svg+xml;base64,${toBase64(svg)}`;


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
          {avatars.map((avatar) => {
            const avatarUrl = toDataUrl(avatar.svg);
            return (
                <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatarUrl)}
                className={cn(
                    'rounded-full p-1 transition-all',
                    selectedAvatar === avatarUrl
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'hover:bg-accent'
                )}
                disabled={isSaving}
                >
                <Avatar className="h-24 w-24">
                    <AvatarImage
                    src={avatarUrl}
                    alt={`Avatar ${avatar.id}`}
                    data-ai-hint={avatar.hint}
                    />
                    <AvatarFallback>AV</AvatarFallback>
                </Avatar>
                </button>
            )
          })}
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
