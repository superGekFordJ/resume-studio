// src/components/resume/SectionEditor.tsx
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  ResumeData,
  PersonalDetails,
  SectionItem,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  CustomTextEntry,
  SectionType,
  ResumeSection,
  isExtendedResumeData,
  isLegacyResumeData,
} from "@/types/resume";
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Sparkles, Save, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import AutocompleteTextarea from '@/components/resume/ui/AutocompleteTextarea';
import AvatarUploader from '@/components/resume/ui/AvatarUploader';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { cn } from "@/lib/utils";
import { useResumeStore } from '@/stores/resumeStore';

interface SectionEditorProps {
  // No props needed anymore
}

export default function SectionEditor({}: SectionEditorProps) {
  const { toast } = useToast();
  const schemaRegistry = SchemaRegistry.getInstance();
  
  // Get state and actions from store
  const resumeData = useResumeStore(state => state.resumeData);
  const editingTarget = useResumeStore(state => state.editingTarget);
  const updateResumeData = useResumeStore(state => state.updateResumeData);
  const setEditingTarget = useResumeStore(state => state.setEditingTarget);
  const isAutocompleteEnabled = useResumeStore(state => state.isAutocompleteEnabled);
  const toggleAutocomplete = useResumeStore(state => state.toggleAutocomplete);
  
  const [localData, setLocalData] = useState<PersonalDetails | ResumeSection | DynamicResumeSection | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  
  const [fieldBeingImproved, setFieldBeingImproved] = useState<{ uniqueFieldId: string, originalText: string } | null>(null);
  const [improvementAISuggestion, setImprovementAISuggestion] = useState<string | null>(null);

  useEffect(() => {
    const isEditingPersonalDetails = editingTarget === 'personalDetails';
    const currentEditingSectionId = (editingTarget && editingTarget !== 'personalDetails') ? editingTarget : null;

    if (isEditingPersonalDetails) {
      setLocalData(JSON.parse(JSON.stringify(resumeData.personalDetails)));
    } else if (currentEditingSectionId) {
      const section = resumeData.sections.find(s => s.id === currentEditingSectionId);
      if (section) {
        setLocalData(JSON.parse(JSON.stringify(section)));
      } else {
        setLocalData(null);
      }
    } else {
      setLocalData(null);
    }
    setAiPrompt(''); 
    setFieldBeingImproved(null); 
    setImprovementAISuggestion(null); 
  }, [editingTarget, resumeData]);

  const handlePersonalDetailsFieldChange = (fieldName: keyof PersonalDetails, value: string) => {
    if (localData && 'fullName' in localData) { 
      const uniqueFieldId = constructUniqueFieldId(true, fieldName, undefined, undefined);
      if(fieldBeingImproved?.uniqueFieldId === uniqueFieldId && value !== fieldBeingImproved.originalText && value !== improvementAISuggestion) {
        onRejectAIImprovement(); 
      }
      setLocalData(prev => ({ ...(prev as PersonalDetails), [fieldName]: value }));
    }
  };

  const handleSectionTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
     if (localData && 'title' in localData) { 
      setLocalData({ ...localData, title: e.target.value });
    }
  };

  // Handle changes for legacy section items
  const handleItemChange = (itemId: string, fieldName: string, value: string, sectionType: SectionType) => {
    if (localData && 'items' in localData && 'type' in localData) { 
      const uniqueFieldId = constructUniqueFieldId(false, fieldName, itemId, sectionType);
       if(fieldBeingImproved?.uniqueFieldId === uniqueFieldId && value !== fieldBeingImproved.originalText && value !== improvementAISuggestion) {
        onRejectAIImprovement(); 
      }
      const updatedItems = (localData.items as SectionItem[]).map(item =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      );
      setLocalData({ ...localData, items: updatedItems });
    }
  };

  // Handle changes for dynamic section items
  const handleDynamicItemChange = (itemId: string, fieldName: string, value: any) => {
    if (localData && 'items' in localData && 'schemaId' in localData) {
      const section = localData as DynamicResumeSection;
      const updatedItems = section.items.map(item =>
        item.id === itemId 
          ? { ...item, data: { ...item.data, [fieldName]: value } }
          : item
      );
      setLocalData({ ...section, items: updatedItems });
    }
  };

  const handleAddItem = () => {
    if (localData && 'items' in localData) {
      // Check if this is a dynamic section
      if ('schemaId' in localData) {
        const section = localData as DynamicResumeSection;
        const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
        if (!sectionSchema) return;

        // For single type sections, only allow one item
        if (sectionSchema.type === 'single' && section.items.length > 0) {
          return; // Already has an item, don't add more
        }

        const newItemId = `${section.schemaId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newDynamicItem: DynamicSectionItem = {
          id: newItemId,
          schemaId: section.schemaId,
          data: {},
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiGenerated: false
          }
        };
        
        setLocalData({ ...section, items: [...section.items, newDynamicItem] });
      } else if ('type' in localData) {
        // Legacy section handling
        const section = localData as ResumeSection;
        const newItemId = `${section.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let newItem: SectionItem;
        switch (section.type) {
          case 'experience':
            newItem = { id: newItemId, jobTitle: '', company: '', startDate: '', endDate: '', description: '' } as ExperienceEntry;
            break;
          case 'education':
            newItem = { id: newItemId, degree: '', institution: '', graduationYear: '', details: '' } as EducationEntry;
            break;
          case 'skills':
            newItem = { id: newItemId, name: '' } as SkillEntry;
            break;
          case 'summary': 
          case 'customText':
            if (section.isList) { 
              newItem = { id: newItemId, content: '' } as CustomTextEntry;
            } else {
              if (section.items.length === 0) {
                   newItem = { id: newItemId, content: '' } as CustomTextEntry;
              } else {
                  toast({ variant: "destructive", title: "Cannot Add Item", description: `This section type (${section.type}) is not a list or already has content.` });
                  return;
              }
            }
            break;
          default:
            return;
        }
        setLocalData({ ...section, items: [...section.items, newItem] });
      }
    }
  };

  // Auto-create item for single type sections if they don't have one
  useEffect(() => {
    if (localData && 'schemaId' in localData) {
      const section = localData as DynamicResumeSection;
      const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
      if (sectionSchema?.type === 'single' && section.items.length === 0) {
        // Auto-create an item for single type sections
        handleAddItem();
      }
    }
  }, [localData]);

  const handleRemoveItem = (itemId: string) => {
    if (localData && 'items' in localData) { 
      if ('schemaId' in localData) {
        // Dynamic section
        const section = localData as DynamicResumeSection;
        const updatedItems = section.items.filter(item => item.id !== itemId);
        setLocalData({ ...section, items: updatedItems });
      } else {
        // Legacy section
        const section = localData as ResumeSection;
        const updatedItems = section.items.filter(item => item.id !== itemId);
        setLocalData({ ...section, items: updatedItems });
      }
    }
  };

  const handleSaveChanges = () => {
    if (!localData) return;

    let updatedResumeData: ResumeData;
    const isEditingPersonalDetails = editingTarget === 'personalDetails';
    const currentEditingSectionId = (editingTarget && editingTarget !== 'personalDetails') ? editingTarget : null;

    if (isEditingPersonalDetails && 'fullName' in localData) {
      updatedResumeData = { ...resumeData, personalDetails: localData as PersonalDetails };
    } else if (currentEditingSectionId && 'title' in localData) {
      updatedResumeData = {
        ...resumeData,
        sections: resumeData.sections.map(s => s.id === currentEditingSectionId ? localData as (ResumeSection | DynamicResumeSection) : s),
      };
    } else {
      return;
    }
    updateResumeData(() => updatedResumeData);
    toast({ title: "Changes Saved", description: "Your resume has been updated." });
    setFieldBeingImproved(null);
    setImprovementAISuggestion(null);
  };

  const handleImproveWithAI = async (textToImprove: string, uniqueFieldId: string) => {
    if (!aiPrompt.trim()) {
      toast({ variant: "destructive", title: "AI Prompt Empty", description: "Please provide a prompt for the AI." });
      return;
    }
    
    setFieldBeingImproved({ uniqueFieldId, originalText: textToImprove });
    setImprovementAISuggestion(null); 
    setIsImproving(true);

    const { isPersonal, fieldName, itemId, sectionType } = deconstructUniqueFieldId(uniqueFieldId);

    try {
      let improvedText: string;
      
      if (isPersonal) {
        // For personal details, use the legacy flow directly for now
        // TODO: Add personal details support to SchemaRegistry
        const { improveResumeSection } = await import('@/ai/flows/improve-resume-section');
        const context = {
          currentItemContext: `Personal Details Field: ${fieldName}`,
          otherSectionsContext: schemaRegistry.stringifyResumeForReview(resumeData),
          userJobTitle: resumeData.personalDetails?.jobTitle || ''
        };
        
        const result = await improveResumeSection({
          resumeSection: textToImprove,
          prompt: aiPrompt,
          context: context,
          sectionType: 'personalDetailsField'
        });
        
        improvedText = result.improvedResumeSection;
      } else if (localData && 'id' in localData && itemId && fieldName) {
        // Use SchemaRegistry for all section fields
        improvedText = await schemaRegistry.improveField({
          resumeData,
          sectionId: localData.id,
          itemId: itemId,
          fieldId: fieldName,
          currentValue: textToImprove,
          prompt: aiPrompt
        });
      } else {
        throw new Error('Invalid field configuration for AI improvement');
      }

      if (improvedText) {
        setImprovementAISuggestion(improvedText);
      } else {
        toast({ variant: "destructive", title: "AI Improvement Failed", description: "Could not get suggestions from AI." });
        setFieldBeingImproved(null); 
      }
    } catch (error) {
      console.error("AI improvement error:", error);
      toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching AI suggestions." });
      setFieldBeingImproved(null); 
    } finally {
      setIsImproving(false);
    }
  };
  
  const onAcceptAIImprovement = (uniqueFieldId: string) => {
    if (fieldBeingImproved?.uniqueFieldId === uniqueFieldId && improvementAISuggestion !== null) {
      const { isPersonal, fieldName, itemId, sectionType } = deconstructUniqueFieldId(uniqueFieldId);

      if (isPersonal && localData && 'fullName' in localData) { 
        setLocalData(prev => ({ ...(prev as PersonalDetails), [fieldName as keyof PersonalDetails]: improvementAISuggestion }));
      } else if (!isPersonal && itemId && fieldName && sectionType && localData && 'items' in localData) {
        // Check if this is a dynamic section
        if ('schemaId' in localData) {
          // Handle dynamic section update
          const dynamicSection = localData as DynamicResumeSection;
          const updatedItems = dynamicSection.items.map(item =>
            item.id === itemId ? { ...item, data: { ...item.data, [fieldName]: improvementAISuggestion } } : item
          );
          setLocalData(prev => ({ ...(prev as DynamicResumeSection), items: updatedItems }));
        } else {
          // Handle legacy section update
          const updatedItems = (localData.items as SectionItem[]).map(item =>
            item.id === itemId ? { ...item, [fieldName]: improvementAISuggestion } : item
          );
          setLocalData(prev => ({ ...(prev as ResumeSection), items: updatedItems }));
        }
      }
      toast({ title: "AI Improvement Applied" });
    }
    setFieldBeingImproved(null);
    setImprovementAISuggestion(null);
    setAiPrompt(''); 
  };

  const onRejectAIImprovement = () => {
    setFieldBeingImproved(null);
    setImprovementAISuggestion(null);
  };

  const constructUniqueFieldId = (isPersonal: boolean, fieldName: string, itemId?: string, sectionType?: SectionType): string => {
    if (isPersonal) return `personal_${fieldName}`;
    const safeItemId = itemId ? itemId.replace(/_/g, '-') : 'no-item'; // Make itemId safe if it contains underscores
    return `${safeItemId}_${sectionType}_${fieldName}`;
  };

  const deconstructUniqueFieldId = (uniqueFieldId: string) => {
    const parts = uniqueFieldId.split('_');
    const isPersonal = parts[0] === 'personal';
    if (isPersonal) {
        return { isPersonal, fieldName: parts.slice(1).join('_'), itemId: undefined, sectionType: undefined as SectionType | undefined };
    }
    const fieldName = parts.pop()!;
    const sectionType = parts.pop()! as SectionType;
    const itemId = parts.join('_').replace(/-/g, '_'); // Restore original itemId
    return { isPersonal, itemId, sectionType, fieldName };
  };


  if (!localData) {
    return (
      <Card className="sticky top-[calc(theme(spacing.16)+1rem)] h-fit no-print">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Edit Section</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an item from the left panel or resume to edit.</p>
        </CardContent>
      </Card>
    );
  }

  const isCurrentlyEditingPersonalDetails = editingTarget === 'personalDetails';

  const renderPersonalDetailsForm = () => {
    const pd = localData as PersonalDetails;
    return (
      <>
        {/* Avatar Upload Section */}
        <div className="mb-6">
          <Label className="text-sm font-medium">Profile Photo</Label>
          <div className="mt-2">
            <AvatarUploader
              value={pd.avatar}
              onChange={(value) => handlePersonalDetailsFieldChange('avatar', value || '')}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {(Object.keys(pd) as Array<keyof PersonalDetails>).filter(key => key !== 'avatar').map(key => {
            const uniqueFieldId = constructUniqueFieldId(true, key, undefined);
            const currentValue = pd[key] || '';
            const isThisFieldBeingImproved = fieldBeingImproved?.uniqueFieldId === uniqueFieldId;
            
            return (
              <AIFieldTextarea
                key={uniqueFieldId}
                id={uniqueFieldId} 
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={isThisFieldBeingImproved && improvementAISuggestion !== null ? fieldBeingImproved.originalText : currentValue}
                onValueChange={value => handlePersonalDetailsFieldChange(key, value)}
                
                currentAiPrompt={aiPrompt}
                onAiPromptChange={setAiPrompt}
                onImproveRequest={() => handleImproveWithAI(currentValue, uniqueFieldId)}
                isImproving={isImproving && isThisFieldBeingImproved}
                
                forcedSuggestion={isThisFieldBeingImproved ? improvementAISuggestion : null}
                onAcceptForcedSuggestion={() => onAcceptAIImprovement(uniqueFieldId)}
                onRejectForcedSuggestion={onRejectAIImprovement}
                
                userJobTitle={resumeData.personalDetails.jobTitle}
                sectionType={'personalDetailsField'}
                currentItem={{ fieldName: key }} 
                allResumeSections={resumeData.sections} 
                currentSectionId={null} 
                className={key === 'fullName' || key === 'jobTitle' || key === 'email' || key === 'phone' || key === 'address' ? "min-h-[40px]" : "min-h-[80px]"}
                isAutocompleteEnabled={isAutocompleteEnabled}
             />
            );
          })}
        </div>
      </>
    );
  };

  const renderSectionForm = () => {
    if (!localData || !('title' in localData)) return null;

    // Check if this is a dynamic section
    if ('schemaId' in localData) {
      return renderDynamicSectionForm();
    } else {
      return renderLegacySectionForm();
    }
  };

  const renderDynamicSectionForm = () => {
    const section = localData as DynamicResumeSection;
    const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
    if (!sectionSchema) return <div>Schema not found for {section.schemaId}</div>;

    return (
      <>
        <div>
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input id="sectionTitle" value={section.title} onChange={handleSectionTitleChange} />
        </div>

        {sectionSchema.type === 'list' && section.items.map((item, index) => (
          <Card key={item.id} className="my-4 p-3 space-y-2 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Item {index + 1}</h4>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {sectionSchema.fields.map(field => {
                // Construct unique field ID for AI improvement tracking
                const uniqueFieldId = constructUniqueFieldId(false, field.id, item.id, section.schemaId as any);
                const currentValue = item.data[field.id] || '';
                const isThisFieldBeingImproved = fieldBeingImproved?.uniqueFieldId === uniqueFieldId;
                
                // For AI-enabled fields, wrap in AIFieldTextarea
                if (field.aiHints?.autocompleteEnabled && (field.type === 'text' || field.type === 'textarea')) {
                  return (
                    <AIFieldTextarea
                      key={field.id}
                      id={uniqueFieldId}
                      label={field.label}
                      value={isThisFieldBeingImproved && improvementAISuggestion !== null ? fieldBeingImproved.originalText : currentValue}
                      onValueChange={(value) => handleDynamicItemChange(item.id, field.id, value)}
                      currentAiPrompt={aiPrompt}
                      onAiPromptChange={setAiPrompt}
                      onImproveRequest={() => handleImproveWithAI(currentValue, uniqueFieldId)}
                      isImproving={isImproving && isThisFieldBeingImproved}
                      forcedSuggestion={isThisFieldBeingImproved ? improvementAISuggestion : null}
                      onAcceptForcedSuggestion={() => onAcceptAIImprovement(uniqueFieldId)}
                      onRejectForcedSuggestion={onRejectAIImprovement}
                      userJobTitle={resumeData.personalDetails.jobTitle}
                      sectionType={section.schemaId as any}
                      currentItem={item as any}
                      allResumeSections={resumeData.sections}
                      currentSectionId={section.id}
                      className={field.uiProps?.rows === 1 || field.type === 'text' ? "min-h-[40px]" : "min-h-[80px]"}
                      isAutocompleteEnabled={isAutocompleteEnabled}
                      placeholder={field.uiProps?.placeholder}
                    />
                  );
                }
                
                // For non-AI fields, use DynamicFieldRenderer
                return (
                  <DynamicFieldRenderer
                    key={field.id}
                    field={field}
                    value={item.data[field.id]}
                    onChange={(value) => handleDynamicItemChange(item.id, field.id, value)}
                    userJobTitle={resumeData.personalDetails.jobTitle}
                    currentItem={item as any}
                    allResumeSections={isLegacyResumeData(resumeData) ? resumeData.sections : resumeData.sections.filter(s => 'type' in s) as ResumeSection[]}
                    currentSectionId={section.id}
                    isAutocompleteEnabled={isAutocompleteEnabled}
                    itemId={item.id}
                    schemaRegistry={schemaRegistry}
                    sectionId={section.id}
                    fieldId={field.id}
                  />
                );
              })}
            </div>
          </Card>
        ))}

        {sectionSchema.type === 'single' && (
          <div className="space-y-3">
            {sectionSchema.fields.map(field => {
              // Ensure we have at least one item for single type sections
              const item = section.items[0];
              if (!item) return null;
              
              const uniqueFieldId = constructUniqueFieldId(false, field.id, item.id, section.schemaId as any);
              const currentValue = item.data[field.id] || '';
              const isThisFieldBeingImproved = fieldBeingImproved?.uniqueFieldId === uniqueFieldId;
              
              // For AI-enabled fields, wrap in AIFieldTextarea
              if (field.aiHints?.autocompleteEnabled && (field.type === 'text' || field.type === 'textarea')) {
                return (
                  <AIFieldTextarea
                    key={field.id}
                    id={uniqueFieldId}
                    label={field.label}
                    value={isThisFieldBeingImproved && improvementAISuggestion !== null ? fieldBeingImproved.originalText : currentValue}
                    onValueChange={(value) => handleDynamicItemChange(item.id, field.id, value)}
                    currentAiPrompt={aiPrompt}
                    onAiPromptChange={setAiPrompt}
                    onImproveRequest={() => handleImproveWithAI(currentValue, uniqueFieldId)}
                    isImproving={isImproving && isThisFieldBeingImproved}
                    forcedSuggestion={isThisFieldBeingImproved ? improvementAISuggestion : null}
                    onAcceptForcedSuggestion={() => onAcceptAIImprovement(uniqueFieldId)}
                    onRejectForcedSuggestion={onRejectAIImprovement}
                    userJobTitle={resumeData.personalDetails.jobTitle}
                    sectionType={section.schemaId as any}
                    currentItem={item as any}
                    allResumeSections={resumeData.sections}
                    currentSectionId={section.id}
                    className={field.uiProps?.rows === 1 || field.type === 'text' ? "min-h-[40px]" : "min-h-[80px]"}
                    isAutocompleteEnabled={isAutocompleteEnabled}
                    placeholder={field.uiProps?.placeholder}
                  />
                );
              }
              
              // For non-AI fields, use DynamicFieldRenderer
              return (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={item.data[field.id]}
                  onChange={(value) => handleDynamicItemChange(item.id, field.id, value)}
                  userJobTitle={resumeData.personalDetails.jobTitle}
                  currentItem={item as any}
                  allResumeSections={isLegacyResumeData(resumeData) ? resumeData.sections : resumeData.sections.filter(s => 'type' in s) as ResumeSection[]}
                  currentSectionId={section.id}
                  isAutocompleteEnabled={isAutocompleteEnabled}
                  itemId={item.id}
                  schemaRegistry={schemaRegistry}
                  sectionId={section.id}
                  fieldId={field.id}
                />
              );
            })}
          </div>
        )}

        {sectionSchema.type === 'list' && (
          <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
            <PlusCircle size={16} className="mr-2" /> Add Item
          </Button>
        )}
      </>
    );
  };

  const renderLegacySectionForm = () => {
    const section = localData as ResumeSection;
    
    // NEW: Universal item renderer that replaces all render*ItemForm functions
    const renderItemFields = (item: any, index: number) => {
      const schemaId = section.type; // Use section type as schema ID for legacy sections
      const schema = schemaRegistry.getSectionSchema(schemaId);
      if (!schema) {
        console.warn(`No schema found for section type: ${schemaId}`);
        return null;
      }

      return (
        <Card key={item.id} className="my-4 p-3 space-y-2 bg-muted/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Item {index + 1}</h4>
            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80">
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="space-y-3">
            {schema.fields.map(field => {
              const uniqueFieldId = constructUniqueFieldId(false, field.id, item.id, section.type);
              const currentValue = item[field.id] || '';
              const isThisFieldBeingImproved = fieldBeingImproved?.uniqueFieldId === uniqueFieldId;
              
              // For AI-enabled fields, wrap in AIFieldTextarea
              if (field.aiHints?.autocompleteEnabled && (field.type === 'text' || field.type === 'textarea')) {
                return (
                  <AIFieldTextarea
                    key={field.id}
                    id={uniqueFieldId}
                    label={field.label}
                    value={isThisFieldBeingImproved && improvementAISuggestion !== null ? fieldBeingImproved.originalText : currentValue}
                    onValueChange={(value) => handleItemChange(item.id, field.id, value, section.type)}
                    currentAiPrompt={aiPrompt}
                    onAiPromptChange={setAiPrompt}
                    onImproveRequest={() => handleImproveWithAI(currentValue, uniqueFieldId)}
                    isImproving={isImproving && isThisFieldBeingImproved}
                    forcedSuggestion={isThisFieldBeingImproved ? improvementAISuggestion : null}
                    onAcceptForcedSuggestion={() => onAcceptAIImprovement(uniqueFieldId)}
                    onRejectForcedSuggestion={onRejectAIImprovement}
                    userJobTitle={resumeData.personalDetails.jobTitle}
                    sectionType={section.type}
                    currentItem={item}
                    allResumeSections={resumeData.sections}
                    currentSectionId={section.id}
                    className={field.uiProps?.rows === 1 || field.type === 'text' ? "min-h-[40px]" : "min-h-[80px]"}
                    isAutocompleteEnabled={isAutocompleteEnabled}
                    placeholder={field.uiProps?.placeholder}
                  />
                );
              }
              
              // For non-AI fields, use DynamicFieldRenderer
              return (
                <DynamicFieldRenderer
                  key={field.id}
                  field={field}
                  value={currentValue}
                  onChange={(value) => handleItemChange(item.id, field.id, value, section.type)}
                  userJobTitle={resumeData.personalDetails.jobTitle}
                  currentItem={item}
                  allResumeSections={resumeData.sections}
                  currentSectionId={section.id}
                  isAutocompleteEnabled={isAutocompleteEnabled}
                  itemId={item.id}
                  schemaRegistry={schemaRegistry}
                  sectionId={section.id}
                  fieldId={field.id}
                />
              );
            })}
          </div>
        </Card>
      );
    };

    return (
      <>
        <div>
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input id="sectionTitle" value={section.title} onChange={handleSectionTitleChange} />
        </div>

        {section.isList && section.items.map((item, index) => renderItemFields(item, index))}

        {!section.isList && section.items.length > 0 && (section.type === 'summary' || (section.type === 'customText' && !section.isList)) &&
          renderItemFields(section.items[0], 0)
        }

        {section.isList && (
          <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
            <PlusCircle size={16} className="mr-2" /> Add Item
          </Button>
        )}
      </>
    );
  };
  
  const editorTitle = isCurrentlyEditingPersonalDetails ? "Personal Details" : (localData && 'title' in localData ? (localData as ResumeSection).title : "Edit Section");

  return (
    <div className="flex flex-col h-full no-print">
      {/* Header with title and controls */}
      <div className="flex flex-row items-center justify-between py-3 px-4 border-b bg-background flex-shrink-0">
        <h2 className="font-headline text-lg font-semibold text-primary">{editorTitle}</h2>
        {editingTarget !== 'personalDetails' && (
          <div className="flex items-center space-x-2">
            <Switch
              id="autocomplete-toggle-nav"
              className="autocomplete-toggle-switch"
              checked={isAutocompleteEnabled}
              onCheckedChange={toggleAutocomplete}
              aria-label="Toggle Autocomplete"
            />
            <Label htmlFor="autocomplete-toggle-nav" className="text-xs cursor-pointer">AI 自动补全</Label>
          </div>
        )}
      </div>
      
      {/* Scrollable Content Area - takes remaining space */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-20 space-y-4">
          {isCurrentlyEditingPersonalDetails ? renderPersonalDetailsForm() : renderSectionForm()}
        </div>
      </div>
      
      {/* Footer with save button - always visible and sticky */}
      <div className="border-t p-4 bg-background flex-shrink-0 sticky bottom-0">
        <Button onClick={handleSaveChanges} size="sm" className="w-full">
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

interface AIFieldTextareaProps {
  id: string; 
  label: string;
  value: string; 
  onValueChange: (value: string) => void; 
  currentAiPrompt: string;
  onAiPromptChange: (prompt: string) => void;
  onImproveRequest: () => void; 
  isImproving: boolean;
  
  forcedSuggestion: string | null; 
  onAcceptForcedSuggestion: () => void; 
  onRejectForcedSuggestion: () => void; 

  userJobTitle?: string;
  sectionType?: SectionType | 'personalDetailsField';
  currentItem?: SectionItem | { fieldName: string }; 
  allResumeSections: ResumeSection[]; 
  currentSectionId: string | null; 
  className?: string;
  placeholder?: string;
  isAutocompleteEnabled: boolean;
}

const AIFieldTextarea: React.FC<AIFieldTextareaProps> = ({
  id, 
  label,
  value, 
  onValueChange,
  currentAiPrompt,
  onAiPromptChange,
  onImproveRequest,
  isImproving,
  forcedSuggestion,
  onAcceptForcedSuggestion,
  onRejectForcedSuggestion,
  userJobTitle,
  sectionType,
  currentItem,
  allResumeSections,
  currentSectionId,
  className,
  placeholder,
  isAutocompleteEnabled,
}) => {
  // Extract field name from id for AutocompleteTextarea
  const fieldName = id.split('_').pop() || label.toLowerCase();
  
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="block mb-1">{label}</Label>
      <AutocompleteTextarea
        id={id} 
        name={fieldName}
        value={value} 
        onValueChange={onValueChange} 
        className={cn("min-h-[80px]", className)} 
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        userJobTitle={userJobTitle}
        sectionType={sectionType}
        currentItem={currentItem}
        allResumeSections={allResumeSections}
        currentSectionId={currentSectionId}
        forcedSuggestion={forcedSuggestion}
        onForcedSuggestionAccepted={onAcceptForcedSuggestion}
        onForcedSuggestionRejected={onRejectForcedSuggestion}
        isAutocompleteEnabledGlobally={isAutocompleteEnabled}
      />
      {/* AI Improvement UI */}
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="text"
          placeholder="AI Prompt (e.g., make it more concise)"
          value={currentAiPrompt}
          onChange={(e) => onAiPromptChange(e.target.value)}
          className="text-xs flex-grow h-8"
          disabled={isImproving || forcedSuggestion !== null} 
        />
        <Button 
            variant="outline" 
            size="sm" 
            onClick={onImproveRequest} 
            disabled={isImproving || !currentAiPrompt.trim() || forcedSuggestion !== null} 
            className="text-xs h-8 px-2 py-1"
        >
          <Sparkles size={14} className="mr-1" /> 
          {isImproving ? 'Improving...' : (forcedSuggestion !== null ? 'Suggested' : 'Improve')}
        </Button>
      </div>
    </div>
  );
};
