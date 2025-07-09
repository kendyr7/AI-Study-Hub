'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Folder } from '@/lib/types';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';

export function FolderContainer({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div 
            ref={setNodeRef}
            className={cn(
                "rounded-2xl border border-white/10 bg-card/50 shadow-lg shadow-black/20 backdrop-blur-lg transition-colors",
                isOver ? 'border-primary bg-primary/10' : ''
            )}
        >
            {children}
        </div>
    );
}


export function FolderItem({ folder, children, disabled }: { folder: Folder, children: React.ReactNode, disabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id, disabled });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: folder.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Conditionally apply attributes to prevent hydration mismatch on server.
  const conditionalAttributes = disabled ? {} : attributes;

  return (
    <div ref={setNodeRef} style={style} {...conditionalAttributes} className={cn(isDragging && "opacity-50")}>
       <FolderContainer id={folder.id}>
        <AccordionItem value={folder.id} className="border-b-0" ref={setDroppableRef}>
            <AccordionTrigger className="hover:no-underline p-4 [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex items-center gap-2 w-full">
                    <div {...listeners} onPointerDown={(e) => e.stopPropagation()} className="p-1 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">{folder.name}</h3>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {children}
            </AccordionContent>
        </AccordionItem>
       </FolderContainer>
    </div>
  );
}
