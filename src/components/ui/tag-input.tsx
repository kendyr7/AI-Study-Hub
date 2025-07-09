'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TagInputProps {
  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TagInput({ allTags, selectedTags, setSelectedTags, disabled, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ',' || e.key === 'Enter') && inputValue) {
      e.preventDefault();
      handleAddTag(inputValue);
      setPopoverOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredTags = allTags.filter(tag => 
    !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  const canCreateTag = inputValue && !selectedTags.includes(inputValue.trim()) && !allTags.some(tag => tag.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <div className="group flex flex-wrap gap-2 p-1.5 border rounded-md bg-transparent min-h-[40px] items-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary">
                {tag}
                <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
            </Badge>
            ))}
            <PopoverTrigger asChild>
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (!popoverOpen) setPopoverOpen(true);
                    }}
                    onFocus={() => setPopoverOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || 'Add tags...'}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 p-1 h-auto bg-transparent"
                    disabled={disabled}
                />
            </PopoverTrigger>
        </div>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>{canCreateTag ? `Press Enter to create "${inputValue.trim()}"` : 'No results found.'}</CommandEmpty>
            {filteredTags.length > 0 && (
              <CommandGroup heading="Suggestions">
                {filteredTags.map(tag => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                        handleAddTag(tag);
                        setPopoverOpen(false);
                    }}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
             {canCreateTag && (
              <CommandGroup heading="New Tag">
                 <CommandItem onSelect={() => {
                    handleAddTag(inputValue);
                    setPopoverOpen(false);
                 }}>
                    Create "{inputValue.trim()}"
                  </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
