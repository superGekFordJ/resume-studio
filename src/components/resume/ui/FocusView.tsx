'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Shrink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AutocompleteTextarea from './AutocompleteTextarea';
import type { AutocompleteModel } from '@/stores/types';

interface FocusViewProps {
  layoutId: string;
  onClose: (finalValue: string) => void;
  textareaProps: {
    id: string;
    name: string;
    initialValue: string;
    className?: string;
    placeholder?: string;
    sectionType?: string;
    isAutocompleteEnabledGlobally: boolean;
    autocompleteModel: AutocompleteModel;
    sectionId: string;
    itemId?: string;
    isMarkdownEnabled?: boolean;
  };
}

export const FocusView = React.memo(function FocusView({
  layoutId,
  onClose,
  textareaProps,
}: FocusViewProps) {
  const [value, setValue] = useState(textareaProps.initialValue);

  const handleClose = useCallback(() => {
    onClose(value);
  }, [onClose, value]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center">
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        layoutId={layoutId}
        className="w-[80vw] h-[80vh] z-50"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative w-full h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8"
            onClick={handleClose}
          >
            <Shrink className="h-6 w-6" />
          </Button>
          <AutocompleteTextarea
            {...textareaProps}
            value={value}
            onValueChange={setValue}
            isFocusMode={true}
          />
        </div>
      </motion.div>
    </div>,
    document.body
  );
});
