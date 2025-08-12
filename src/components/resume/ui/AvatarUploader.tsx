'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploaderProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export default function AvatarUploader({
  value,
  onChange,
  className,
}: AvatarUploaderProps) {
  const { t } = useTranslation('components');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: t('AvatarUploader.selectImageError'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: t('AvatarUploader.fileSizeError'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: t('AvatarUploader.fileReadError'),
        variant: 'destructive',
      });
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Avatar"
              className="w-full h-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Remove Button */}
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleUploadClick}
        disabled={isLoading}
        className="text-xs"
      >
        <Upload className="mr-2 h-3 w-3" />
        {isLoading
          ? t('AvatarUploader.uploading')
          : value
            ? t('AvatarUploader.changePhoto')
            : t('AvatarUploader.uploadPhoto')}
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Info */}
      <p className="text-xs text-muted-foreground text-center">
        {t('AvatarUploader.fileTypes')}
      </p>
    </div>
  );
}
