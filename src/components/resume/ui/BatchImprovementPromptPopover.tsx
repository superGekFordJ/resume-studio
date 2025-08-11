'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface BatchImprovementPromptPopoverProps {
  children: React.ReactNode;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  sectionTitle: string;
}

export function BatchImprovementPromptPopover({
  children,
  onSubmit,
  isLoading,
  sectionTitle,
}: BatchImprovementPromptPopoverProps) {
  const { t } = useTranslation('components');
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
      setIsOpen(false);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setPrompt(''); // Reset prompt on close
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t('BatchImprovementPromptPopover.title', { sectionTitle })}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t('BatchImprovementPromptPopover.description')}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt-popover" className="sr-only">
              {t('BatchImprovementPromptPopover.promptLabel')}
            </Label>
            <Input
              id="prompt-popover"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('BatchImprovementPromptPopover.promptPlaceholder')}
              className="focus-visible:ring-orange-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            size="sm"
            className="w-full bg-orange-400 hover:bg-orange-500 text-white"
          >
            {isLoading
              ? t('BatchImprovementPromptPopover.improving')
              : t('BatchImprovementPromptPopover.generate')}
            <Wand2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
