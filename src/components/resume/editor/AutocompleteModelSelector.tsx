'use client';

import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from '@/components/ui/wheel-picker';
import { useResumeStore } from '@/stores/resumeStore';
import { AutocompleteModel } from '@/stores/types';
import { useTranslation } from 'react-i18next';

interface AutocompleteModelSelectorProps {
  className?: string;
}

export default function AutocompleteModelSelector({
  className,
}: AutocompleteModelSelectorProps) {
  const { t } = useTranslation('components');
  const autocompleteModel = useResumeStore(
    (state) => state.aiConfig.autocompleteModel
  );
  const setAutocompleteModel = useResumeStore(
    (state) => state.setAutocompleteModel
  );

  const options: WheelPickerOption[] = [
    { value: 'lite', label: t('AutocompleteModelSelector.lite') },
    { value: 'smart', label: t('AutocompleteModelSelector.smart') },
    { value: 'slow', label: t('AutocompleteModelSelector.slow') },
  ];

  return (
    <WheelPickerWrapper
      className={`w-[240px] border-0 bg-transparent dark:bg-transparent shadow-none dark:shadow-none rounded-none px-0 ${className || ''}`}
    >
      <WheelPicker
        options={options}
        value={autocompleteModel}
        onValueChange={(value) =>
          setAutocompleteModel(value as AutocompleteModel)
        }
        infinite
        visibleCount={8}
        optionItemHeight={28}
      />
    </WheelPickerWrapper>
  );
}
