'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { FieldSchema } from '@/types/schema';
import AutocompleteTextarea from '@/components/resume/ui/AutocompleteTextarea';

interface DynamicFieldRendererProps {
  field: FieldSchema;
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  isAutocompleteEnabled?: boolean;
  onImproveField?: (fieldId: string, currentValue: string) => void;
  isImproving?: boolean;
  className?: string;
  itemId?: string;
  schemaRegistry?: unknown;
  sectionId?: string;
  fieldId?: string;
}

export default function DynamicFieldRenderer({
  field,
  value,
  onChange,
  isAutocompleteEnabled = false,
  className,
  itemId,
  sectionId,
}: DynamicFieldRendererProps) {
  const localFieldId = field.id;
  const isRequired = field.required || false;
  const aiEnabled =
    field.aiHints?.autocompleteEnabled !== false && isAutocompleteEnabled;
  const [customInput, setCustomInput] = React.useState('');

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            id={localFieldId}
            type={field.type === 'text' ? 'text' : field.type}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.uiProps?.placeholder}
            maxLength={field.uiProps?.maxLength}
            required={isRequired}
            className={className}
          />
        );

      case 'date':
        return (
          <Input
            id={localFieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={isRequired}
            className={className}
          />
        );

      case 'textarea':
        if (aiEnabled) {
          // NOTE: AutocompleteTextarea now fetches its own context data.
          // We only need to pass the essential IDs.
          return (
            <AutocompleteTextarea
              value={(value as string) || ''}
              onValueChange={onChange}
              placeholder={field.uiProps?.placeholder}
              rows={field.uiProps?.rows || 3}
              isAutocompleteEnabledGlobally={isAutocompleteEnabled}
              className={className}
              name={field.id}
              sectionId={sectionId || ''}
              itemId={itemId}
              // The autocompleteModel is fetched from the store inside the component
              // so we don't need to pass it down.
              autocompleteModel="lite"
            />
          );
        } else {
          return (
            <textarea
              id={localFieldId}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.uiProps?.placeholder}
              rows={field.uiProps?.rows || 3}
              required={isRequired}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
            />
          );
        }

      case 'select':
        return (
          <Select value={(value as string) || ''} onValueChange={onChange}>
            <SelectTrigger className={className}>
              <SelectValue
                placeholder={
                  field.uiProps?.placeholder || `Select ${field.label}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {field.uiProps?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'combobox':
        const comboboxOptions = (field.uiProps?.options || []).map(
          (option) => ({
            value: option,
            label: option,
          })
        );

        return (
          <Combobox
            options={comboboxOptions}
            value={(value as string) || ''}
            onValueChange={onChange}
            placeholder={
              field.uiProps?.placeholder || `Select or enter ${field.label}`
            }
            searchPlaceholder={`Search ${field.label}...`}
            emptyText={`No ${field.label.toLowerCase()} found.`}
            allowCustomValue={true}
            className={className}
            dropdownMode="floating"
          />
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        const availableOptions = field.uiProps?.options || [];

        return (
          <div className="space-y-2">
            {/* Custom input for adding new values */}
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={field.uiProps?.placeholder || `Add ${field.label}`}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    e.preventDefault();
                    if (!selectedValues.includes(customInput.trim())) {
                      onChange([...selectedValues, customInput.trim()]);
                      setCustomInput('');
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    customInput.trim() &&
                    !selectedValues.includes(customInput.trim())
                  ) {
                    onChange([...selectedValues, customInput.trim()]);
                    setCustomInput('');
                  }
                }}
                disabled={
                  !customInput.trim() ||
                  selectedValues.includes(customInput.trim())
                }
              >
                Add
              </Button>
            </div>

            {/* Predefined options (if any) */}
            {availableOptions.length > 0 && (
              <Select
                onValueChange={(selectedOption) => {
                  if (!selectedValues.includes(selectedOption)) {
                    onChange([...selectedValues, selectedOption]);
                  }
                }}
              >
                <SelectTrigger className={className}>
                  <SelectValue placeholder="Or select from predefined options" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions
                    .filter((option) => !selectedValues.includes(option))
                    .map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((selectedValue, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {selectedValue}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newValues = selectedValues.filter(
                          (_, i) => i !== index
                        );
                        onChange(newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'array':
        const arrayValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {arrayValues.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item || ''}
                  onChange={(e) => {
                    const newArray = [...arrayValues];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  placeholder={`${field.label} ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newArray = arrayValues.filter((_, i) => i !== index);
                    onChange(newArray);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange([...arrayValues, ''])}
            >
              Add {field.label}
            </Button>
          </div>
        );

      case 'object':
        // For complex object fields, we'd need to recursively render sub-fields
        // This is a simplified implementation
        return (
          <div className="p-3 border rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Complex object field - custom implementation needed
            </p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );

      default:
        return (
          <Input
            id={localFieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.uiProps?.placeholder}
            className={className}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={localFieldId} className="text-sm font-medium">
        {field.label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {field.validation && (
        <div className="text-xs text-muted-foreground">
          {field.validation.map((rule, index) => (
            <div key={index}>{rule.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}
