import React, {
  useState,
  useCallback,
  DragEvent,
  ClipboardEvent,
  useRef,
} from 'react';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
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
}

export const ImageUploadArea = React.forwardRef<
  HTMLTextAreaElement,
  ImageUploadAreaProps
>(
  (
    { onImageUpload, value, onChange, id, className, ...props },
    forwardedRef
  ) => {
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
            title: 'Invalid File Type',
            description: 'Please upload an image file.',
            variant: 'destructive',
          });
        }
      },
      [onImageUpload, toast]
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
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-4 pointer-events-none text-center">
          {isDragging ? (
            <div className="text-primary">
              <UploadCloud className="mx-auto h-8 w-8" />
              <p className="mt-2 text-sm font-semibold">Release to upload</p>
            </div>
          ) : (
            !value && (
              <div className="text-muted-foreground">
                <UploadCloud className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-primary">
                    Click to type
                  </span>
                  , paste, or drag & drop a job post screenshot.
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
