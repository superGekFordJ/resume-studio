import React, {
  useState,
  useCallback,
  DragEvent,
  ClipboardEvent,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadAreaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'value'
  > {
  onImageUpload: (file: File) => void;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  isLoading?: boolean;
}

export const ImageUploadArea = React.forwardRef<
  HTMLTextAreaElement,
  ImageUploadAreaProps
>(
  (
    { onImageUpload, value, onChange, id, className, isLoading, ...props },
    forwardedRef
  ) => {
    const { t } = useTranslation('components');
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const setRefs = useCallback(
      (node: HTMLTextAreaElement) => {
        (
          textAreaRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    const handleFile = useCallback(
      (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
          onImageUpload(file);
        } else if (file) {
          toast({
            title: t('ImageUploadArea.invalidFileType'),
            description: t('ImageUploadArea.pleaseUploadImage'),
            variant: 'destructive',
          });
        }
      },
      [onImageUpload, toast, t]
    );

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    };

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              handleFile(file);
              return;
            }
          }
        }
      },
      [handleFile]
    );

    return (
      <div
        className={cn(
          'relative border-2 border-dashed rounded-md transition-all duration-200',
          'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          isDragging ? 'border-primary bg-accent' : 'border-input',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => textAreaRef.current?.focus()}
      >
        <Textarea
          ref={setRefs}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          className={cn(
            'bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
            isLoading && 'pointer-events-none'
          )}
          disabled={isLoading}
          {...props}
        />
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm font-medium text-foreground">
              {t('ImageUploadArea.processingImage')}
            </p>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-4 pointer-events-none text-center">
          {isDragging ? (
            <div className="text-primary">
              <UploadCloud className="mx-auto h-8 w-8" />
              <p className="mt-2 text-sm font-semibold">
                {t('ImageUploadArea.releaseToUpload')}
              </p>
            </div>
          ) : (
            !value &&
            !isLoading && (
              <div className="text-muted-foreground">
                <UploadCloud className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-primary">
                    {t('ImageUploadArea.clickToType')}
                  </span>
                  {t('ImageUploadArea.pasteOrDrag')}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);

ImageUploadArea.displayName = 'ImageUploadArea';
