import { Button } from '@/components/ui/button';
import {
  Download,
  Printer,
  ChevronDown,
  Settings,
  History,
  Code,
} from 'lucide-react';
import Logo from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResumeStore } from '@/stores/resumeStore';
import { reviewResume } from '@/ai/flows/review-resume';
import { schemaRegistry } from '@/lib/schemaRegistry';
import { useToast } from '@/hooks/use-toast';
import { SettingsPanel } from './SettingsPanel';
import VersionSnapshotDialog from '@/components/ui/VersionSnapshotDialog';
import { useState, useRef } from 'react';

/* New: AIHubButton (icon-only, gradient+glow). Placed under layout per architecture */
import AIHubButton from './AIHubButton';
import AIHubHoverMenu from './AIHubHoverMenu';

interface HeaderProps {
  onExportPdf: () => void;
  onPrint?: () => void;
}

export default function Header({ onExportPdf, onPrint }: HeaderProps) {
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isAiMenuVisible, setIsAiMenuVisible] = useState(false);
  const aiMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeData = useResumeStore((state) => state.resumeData);
  const aiConfig = useResumeStore((state) => state.aiConfig);
  const setIsReviewDialogOpen = useResumeStore(
    (state) => state.setIsReviewDialogOpen
  );
  const setReviewContent = useResumeStore((state) => state.setReviewContent);
  const setIsReviewLoading = useResumeStore(
    (state) => state.setIsReviewLoading
  );
  const exportCurrentSchema = useResumeStore(
    (state) => state.exportCurrentSchema
  );

  const handleAiMenuMouseEnter = () => {
    if (aiMenuTimerRef.current) {
      clearTimeout(aiMenuTimerRef.current);
    }
    aiMenuTimerRef.current = setTimeout(() => {
      setIsAiMenuVisible(true);
    }, 150); // Delay before showing
  };

  const handleAiMenuMouseLeave = () => {
    if (aiMenuTimerRef.current) {
      clearTimeout(aiMenuTimerRef.current);
    }
    aiMenuTimerRef.current = setTimeout(() => {
      setIsAiMenuVisible(false);
    }, 300); // Longer delay before hiding
  };

  const handleReviewResume = async () => {
    setIsReviewLoading(true);
    setReviewContent(null);
    setIsReviewDialogOpen(true);
    try {
      const dataForReview = {
        ...resumeData,
        aiConfig: aiConfig,
      };
      const resumeText = schemaRegistry.stringifyResumeForReview(dataForReview);
      const result = await reviewResume({ resumeText });
      setReviewContent(result);
    } catch (error) {
      console.error('AI Review error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get AI review.',
      });
      setReviewContent({
        overallQuality: 'Error fetching review.',
        suggestions: 'Please try again.',
      });
    } finally {
      setIsReviewLoading(false);
    }
  };

  return (
    <>
      <header className="bg-card border-b sticky top-0 z-40 no-print">
        {/* Three-section layout: Left brand | Center AI icon | Right utilities */}
        {/* Use CSS Grid for robust three-column centering */}
        <div className="container mx-auto px-4 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: Brand (aligns to the start of the first column) */}
          <div className="flex items-center gap-2 justify-self-start">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-semibold text-foreground">
              Resume Studio
            </h1>
          </div>

          {/* Center: AI icon-only (truly centered in the middle column) */}
          <div
            className="justify-self-center relative"
            onMouseEnter={handleAiMenuMouseEnter}
            onMouseLeave={handleAiMenuMouseLeave}
          >
            <AIHubButton
              ariaLabel="AI Assistant"
              // Keep a primary click action, e.g., open review directly
              onClick={handleReviewResume}
              size="md"
            />
            <AIHubHoverMenu
              isVisible={isAiMenuVisible}
              onReviewClick={handleReviewResume}
              // onAgentClick would be wired here in the future
            />
          </div>

          {/* Right: Utilities (aligns to the end of the third column) */}
          <div className="flex items-center gap-2 justify-self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVersionsOpen(true)}
            >
              <History className="mr-2 h-4 w-4" />
              Versions
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>

            {/* Dev-only: Export Schema */}
            {(process.env.NODE_ENV === 'development' ||
              process.env.NEXT_PUBLIC_ENABLE_SCHEMA_EXPORT === 'true') && (
              <Button variant="outline" size="sm" onClick={exportCurrentSchema}>
                <Code className="mr-2 h-4 w-4" />
                Export Schema
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExportPdf()}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                {onPrint && (
                  <DropdownMenuItem onClick={() => onPrint()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Resume
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SettingsPanel open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      <VersionSnapshotDialog
        open={isVersionsOpen}
        onOpenChange={setIsVersionsOpen}
      />
    </>
  );
}
