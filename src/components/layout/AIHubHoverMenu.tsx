'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AIHubHoverMenuProps {
  onReviewClick?: () => void;
  onAgentClick?: () => void;
  className?: string;
  isVisible: boolean;
}

export function AIHubHoverMenu({
  onReviewClick,
  onAgentClick,
  className,
  isVisible,
}: AIHubHoverMenuProps) {
  return (
    <div
      className={cn(
        'absolute top-full mt-3 flex flex-col items-center gap-2',
        'transition-all duration-200 ease-in-out',
        'pointer-events-none opacity-0 translate-y-1',
        isVisible && 'pointer-events-auto opacity-100 translate-y-0',
        className
      )}
      aria-hidden={!isVisible}
    >
      <Button
        variant="outline"
        size="sm"
        className="bg-card/80 backdrop-blur-sm"
        onClick={onReviewClick}
        tabIndex={isVisible ? 0 : -1}
      >
        <ThumbsUp className="mr-2 h-4 w-4" />
        AI Review
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-card/80 backdrop-blur-sm"
        onClick={onAgentClick}
        tabIndex={isVisible ? 0 : -1}
        disabled
        aria-disabled="true"
        title="Dialogue Agent is coming soon"
        aria-label="Dialogue Agent (coming soon)"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Dialogue Agent
      </Button>
    </div>
  );
}

export default AIHubHoverMenu;
