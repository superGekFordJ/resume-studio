'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useResumeStore } from '@/stores/resumeStore';
import { AutocompleteModel } from '@/stores/types';
import { useTranslation } from 'react-i18next';
import { WheelEvent } from 'react';

interface AutocompleteModelSelectorProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

const models: AutocompleteModel[] = ['lite', 'smart', 'slow'];

export default function AutocompleteModelSelector({
  className,
  onOpenChange,
}: AutocompleteModelSelectorProps) {
  const { t } = useTranslation('components');
  const autocompleteModel = useResumeStore(
    (state) => state.aiConfig.autocompleteModel
  );
  const setAutocompleteModel = useResumeStore(
    (state) => state.setAutocompleteModel
  );

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const currentIndex = models.indexOf(autocompleteModel);
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + models.length) % models.length;
    setAutocompleteModel(models[nextIndex]);
  };

  return (
    <Select
      value={autocompleteModel}
      onValueChange={(value) =>
        setAutocompleteModel(value as AutocompleteModel)
      }
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        className={`h-8 text-xs ${className || ''}`}
        onWheel={handleWheel}
      >
        <SelectValue placeholder={t('AutocompleteModelSelector.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lite">
          {t('AutocompleteModelSelector.lite')}
        </SelectItem>
        <SelectItem value="smart">
          {t('AutocompleteModelSelector.smart')}
        </SelectItem>
        <SelectItem value="slow">
          {t('AutocompleteModelSelector.slow')}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
