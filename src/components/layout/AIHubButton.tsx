import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AIHubButton
 * Icon-only, center-focused AI entry with distinctive gradient + glow.
 * Motion is CSS-driven (see class names below; you can extend in globals.css if needed).
 *
 * Props:
 * - onClick: click handler (open AI review / open agent hub)
 * - busy: future reserved prop to indicate ongoing AI operation (adds subtle pulse)
 * - ariaLabel: accessibility label (defaults to "AI Assistant")
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - className: extra class names
 */
export interface AIHubButtonProps {
  onClick?: () => void;
  busy?: boolean;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<Required<AIHubButtonProps>['size'], string> = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

export default function AIHubButton({
  onClick,
  busy = false,
  ariaLabel = 'AI Assistant',
  size = 'md',
  className,
}: AIHubButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        // base layout
        'relative rounded-full inline-flex items-center justify-center select-none outline-none ring-0',
        sizeMap[size],
        // visual core: multi-color conic gradient disc
        'bg-[conic-gradient(from_0deg,_#675CFF,_#00D4FF,_#FF4D95,_#A8FF78,_#675CFF)]',
        // hover/active micro-interactions
        'transition-transform duration-150',
        'hover:scale-[1.03] active:scale-[0.97]',
        // subtle glow and focus treatment
        'focus-visible:ring-2 focus-visible:ring-primary/60',
        // custom animation hooks (define keyframes in globals if desired)
        'aihub-glow',
        busy && 'aihub-pulse',
        className
      )}
    >
      {/* Inner mask to soften glow and add depth separation from page background */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-[2px] rounded-full pointer-events-none',
          'bg-background/20 dark:bg-background/10'
        )}
      />
      {/* Current brand placeholder icon; can be replaced by custom SVG later */}
      <Sparkles
        aria-hidden="true"
        className={cn(
          'relative z-10 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.65)]',
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-5 w-5',
          size === 'lg' && 'h-6 w-6'
        )}
      />
      {/* Optional decorative ring on hover for extra liveliness (can be styled in globals) */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-1 rounded-full opacity-0',
          'transition-opacity duration-200',
          'hover:opacity-60',
          // soft outer glow using gradient to match disc
          'bg-[conic-gradient(from_180deg,_rgba(103,92,255,0.15),_rgba(0,212,255,0.12),_rgba(255,77,149,0.12),_rgba(168,255,120,0.12),_rgba(103,92,255,0.15))]',
          // blur to make glow feel airy
          'blur-[6px]'
        )}
      />
    </button>
  );
}

// /* Suggested CSS to add in globals.css for richer motion (optional):
// @media (prefers-reduced-motion: no-preference) {
//   .aihub-glow {
//     /* very subtle hue drift; keep small to avoid distraction */
//     animation: aihubHue 6s ease-in-out infinite alternate;
//   }
//   .aihub-pulse {
//     animation:
//       aihubHue 6s ease-in-out infinite alternate,
//       aihubPulse 2400ms ease-in-out infinite;
//   }
//   @keyframes aihubHue {
//     0%   { filter: hue-rotate(0deg); }
//     100% { filter: hue-rotate(16deg); }
//   }
//   @keyframes aihubPulse {
//     0%   { box-shadow: 0 0 0px 0 rgba(103,92,255,0.0); }
//     50%  { box-shadow: 0 0 18px 6px rgba(103,92,255,0.22); }
//     100% { box-shadow: 0 0 0px 0 rgba(103,92,255,0.0); }
//   }
// }
// */
