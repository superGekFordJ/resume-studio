'use client';

import React from 'react';
import { PersonalDetails } from '@/types/resume';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '@/stores/resumeStore';
import AvatarUploader from '@/components/resume/ui/AvatarUploader';
import AIFieldWrapper from './AIFieldWrapper';

interface PersonalDetailsEditorProps {
  personalDetails: PersonalDetails;
}

function PersonalDetailsEditor({
  personalDetails,
}: PersonalDetailsEditorProps) {
  const updateField = useResumeStore((state) => state.updateField);
  const isAutocompleteEnabled = useResumeStore(
    (state) => state.isAutocompleteEnabled
  );

  const handleFieldChange = (
    fieldName: keyof PersonalDetails,
    value: string
  ) => {
    updateField({
      sectionId: '',
      fieldId: fieldName,
      value,
      isPersonalDetails: true,
    });
  };

  const constructUniqueFieldId = (fieldName: string): string => {
    return `personal_${fieldName}`;
  };

  return (
    <>
      {/* Avatar Upload Section */}
      <div className="mb-6">
        <Label className="text-sm font-medium">Profile Photo</Label>
        <div className="mt-2">
          <AvatarUploader
            value={personalDetails.avatar}
            onChange={(value: string | undefined) =>
              handleFieldChange('avatar', value || '')
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(personalDetails) as Array<keyof PersonalDetails>)
          .filter((key) => key !== 'avatar')
          .map((key) => {
            const uniqueFieldId = constructUniqueFieldId(key);
            const currentValue = personalDetails[key] || '';

            return (
              <AIFieldWrapper
                key={uniqueFieldId}
                uniqueFieldId={uniqueFieldId}
                label={key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
                value={currentValue}
                onValueChange={(value: string) => handleFieldChange(key, value)}
                fieldId={key}
                sectionId=""
                isPersonalDetails={true}
                sectionType="personalDetailsField"
                className={
                  key === 'fullName' ||
                  key === 'jobTitle' ||
                  key === 'email' ||
                  key === 'phone' ||
                  key === 'address'
                    ? 'min-h-[40px]'
                    : 'min-h-[80px]'
                }
                isAutocompleteEnabled={isAutocompleteEnabled}
              />
            );
          })}
      </div>
    </>
  );
}

export default React.memo(PersonalDetailsEditor);
