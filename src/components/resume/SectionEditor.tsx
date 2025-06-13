
// src/components/resume/SectionEditor.tsx
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  ResumeData,
  PersonalDetails,
  Section,
  SectionItem,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  CustomTextEntry,
  SectionType,
  ResumeSection,
} from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Sparkles, Save, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { improveResumeSection, ImproveResumeSectionInput } from '@/ai/flows/improve-resume-section';
import { useToast } from '@/hooks/use-toast';
import AutocompleteTextarea from './AutocompleteTextarea';
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  resumeData: ResumeData;
  targetToEdit: string | null; 
  onUpdateResumeData: (updatedData: ResumeData) => void;
  onCloseEditor: () => void;
  isAutocompleteEnabled: boolean;
  onToggleAutocomplete: (enabled: boolean) => void;
}

export default function SectionEditor({
  resumeData,
  targetToEdit,
  onUpdateResumeData,
  onCloseEditor,
  isAutocompleteEnabled,
  onToggleAutocomplete,
}: SectionEditorProps) {
  const { toast } = useToast();
  const [localData, setLocalData] = useState<PersonalDetails | Section | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  
  const [fieldBeingImproved, setFieldBeingImproved] = useState<{ uniqueFieldId: string, originalText: string } | null>(null);
  const [improvementAISuggestion, setImprovementAISuggestion] = useState<string | null>(null);


  useEffect(() => {
    const isEditingPersonalDetails = targetToEdit === 'personalDetails';
    const currentEditingSectionId = (targetToEdit && targetToEdit !== 'personalDetails') ? targetToEdit : null;

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
  }, [targetToEdit, resumeData]);

  const handlePersonalDetailsFieldChange = (fieldName: keyof PersonalDetails, value: string) => {
    if (localData && 'fullName' in localData) { 
      const uniqueFieldId = constructUniqueFieldId(true, fieldName, undefined, 'personalDetailsField');
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

  const handleItemChange = (itemId: string, fieldName: string, value: string, sectionType: SectionType) => {
    if (localData && 'items' in localData) { 
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

  const handleAddItem = () => {
    if (localData && 'items' in localData && 'type' in localData) {
      const section = localData as Section;
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
  };

  const handleRemoveItem = (itemId: string) => {
    if (localData && 'items' in localData) { 
      const updatedItems = (localData.items as SectionItem[]).filter(item => item.id !== itemId);
      setLocalData({ ...localData, items: updatedItems });
    }
  };

  const handleSaveChanges = () => {
    if (!localData) return;

    let updatedResumeData: ResumeData;
    const isEditingPersonalDetails = targetToEdit === 'personalDetails';
    const currentEditingSectionId = (targetToEdit && targetToEdit !== 'personalDetails') ? targetToEdit : null;

    if (isEditingPersonalDetails && 'fullName' in localData) {
      updatedResumeData = { ...resumeData, personalDetails: localData as PersonalDetails };
    } else if (currentEditingSectionId && 'title' in localData) {
      updatedResumeData = {
        ...resumeData,
        sections: resumeData.sections.map(s => s.id === currentEditingSectionId ? localData as Section : s),
      };
    } else {
      return;
    }
    onUpdateResumeData(updatedResumeData);
    toast({ title: "Changes Saved", description: "Your resume has been updated." });
    setFieldBeingImproved(null);
    setImprovementAISuggestion(null);
  };

  const buildCurrentItemContextForAI = useCallback((
    isPersonal: boolean, 
    fieldName?: string, 
    currentItemData?: SectionItem, 
    sectionType?: SectionType
  ): string | undefined => {
    if (isPersonal && fieldName) {
        return `Field: ${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
    }
    if (!currentItemData || !sectionType || !('id' in currentItemData)) return undefined;

    switch (sectionType) {
      case 'experience':
        const exp = currentItemData as ExperienceEntry;
        return `Job: ${exp.jobTitle || 'Untitled Job'} at ${exp.company || 'Unnamed Company'}. Current content of field being edited ('${fieldName}'): ${exp[fieldName as keyof ExperienceEntry]?.toString().substring(0,100) || ''}...`;
      case 'education':
        const edu = currentItemData as EducationEntry;
        return `Degree: ${edu.degree || 'Untitled Degree'} from ${edu.institution || 'Unnamed Institution'}. Current content of field being edited ('${fieldName}'): ${edu[fieldName as keyof EducationEntry]?.toString().substring(0,100) || ''}...`;
      case 'skills':
        const skill = currentItemData as SkillEntry;
        return `Skill: ${skill.name || 'Unnamed Skill'}. Current content of field being edited ('${fieldName}'): ${skill[fieldName as keyof SkillEntry]?.toString().substring(0,100) || ''}...`;
      case 'summary':
      case 'customText':
        const custom = currentItemData as CustomTextEntry;
        return `Current content of field being edited ('${fieldName}'): ${custom[fieldName as keyof CustomTextEntry]?.toString().substring(0,150) || ''}...`;
      default:
        return undefined;
    }
  }, []);

  const buildOtherSectionsContextForAI = useCallback((allResumeSections: ResumeSection[], currentSectionIdToExclude: string | null): string | undefined => {
    if (!allResumeSections || allResumeSections.length === 0) return undefined;
    
    let contextStr = "";
    allResumeSections.forEach(sec => {
      if (sec.id === currentSectionIdToExclude) return; 
      
      contextStr += `Section: ${sec.title} (Type: ${sec.type})\n`;
      if (sec.type === 'summary' && sec.items.length > 0) {
        const summaryItem = sec.items[0] as CustomTextEntry;
        if (summaryItem.content) contextStr += `  Content: ${summaryItem.content.substring(0, 100)}...\n`;
      } else if (sec.type === 'skills' && sec.items.length > 0) {
        const skillNames = sec.items.slice(0, 5).map(s => (s as SkillEntry).name).join(', ');
        if (skillNames) contextStr += `  Skills: ${skillNames}...\n`;
      } else if (sec.type === 'experience' && sec.items.length > 0) {
        const expPreview = sec.items.slice(0,1).map(e => `${(e as ExperienceEntry).jobTitle} at ${(e as ExperienceEntry).company}: ${(e as ExperienceEntry).description.substring(0,50)}...`).join('; ');
        if (expPreview) contextStr += `  Recent Experience: ${expPreview}...\n`;
      } else if (sec.type === 'education' && sec.items.length > 0) {
        const eduPreview = sec.items.slice(0,1).map(e => `${(e as EducationEntry).degree} at ${(e as EducationEntry).institution}`).join('; ');
        if (eduPreview) contextStr += `  Recent Education: ${eduPreview}...\n`;
      } else if (sec.type === 'customText' && sec.items.length > 0) {
         const content = (sec.items[0] as CustomTextEntry).content;
         if (content) contextStr += `  "${sec.title}" Content: ${content.substring(0, 100)}...\n`;
      }
    });
    return contextStr.trim() ? contextStr : undefined;
  }, []);


  const handleImproveWithAI = async (textToImprove: string, uniqueFieldId: string) => {
    if (!aiPrompt.trim()) {
      toast({ variant: "destructive", title: "AI Prompt Empty", description: "Please provide a prompt for the AI." });
      return;
    }
    
    setFieldBeingImproved({ uniqueFieldId, originalText: textToImprove });
    setImprovementAISuggestion(null); 
    setIsImproving(true);

    const { isPersonal, fieldName, itemId, sectionType } = deconstructUniqueFieldId(uniqueFieldId);
    let currentItemForContext: SectionItem | undefined = undefined;
    let currentSectionIdForContext: string | null = null;
    let actualSectionTypeForAI: SectionType | 'personalDetailsField' | undefined = sectionType;


    if (isPersonal) {
        actualSectionTypeForAI = 'personalDetailsField';
    } else if (itemId && sectionType && localData && 'items' in localData) {
        currentItemForContext = (localData.items as SectionItem[]).find(it => it.id === itemId);
        currentSectionIdForContext = (localData as Section).id;
    }
    
    const currentItemContext = buildCurrentItemContextForAI(isPersonal, fieldName, currentItemForContext, sectionType);
    const otherSectionsContext = buildOtherSectionsContextForAI(resumeData.sections, isPersonal ? null : currentSectionIdForContext);

    try {
      const input: ImproveResumeSectionInput = { 
        resumeSection: textToImprove, 
        prompt: aiPrompt,
        userJobTitle: resumeData.personalDetails.jobTitle,
        sectionType: actualSectionTypeForAI,
        currentItemContext: currentItemContext,
        otherSectionsContext: otherSectionsContext,
      };
      const result = await improveResumeSection(input);

      if (result.improvedResumeSection) {
        setImprovementAISuggestion(result.improvedResumeSection);
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
        const updatedItems = (localData.items as SectionItem[]).map(item =>
          item.id === itemId ? { ...item, [fieldName]: improvementAISuggestion } : item
        );
        setLocalData(prev => ({ ...(prev as Section), items: updatedItems }));
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

  const isCurrentlyEditingPersonalDetails = targetToEdit === 'personalDetails';

  const renderPersonalDetailsForm = () => {
    const pd = localData as PersonalDetails;
    return (
      <>
        <div className="space-y-3">
          {(Object.keys(pd) as Array<keyof PersonalDetails>).map(key => {
            const uniqueFieldId = constructUniqueFieldId(true, key, undefined, 'personalDetailsField');
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
    const section = localData as Section;
    return (
      <>
        <div>
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input id="sectionTitle" value={section.title} onChange={handleSectionTitleChange} />
        </div>

        {section.isList && section.items.map((item, index) => (
          <Card key={item.id} className="my-4 p-3 space-y-2 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Item {index + 1}</h4>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive/80">
                <Trash2 size={16} />
              </Button>
            </div>
            {section.type === 'experience' && renderExperienceItemForm(item as ExperienceEntry, section.type, item, section.id)}
            {section.type === 'education' && renderEducationItemForm(item as EducationEntry, section.type, item, section.id)}
            {section.type === 'skills' && renderSkillItemForm(item as SkillEntry, section.type, item, section.id)}
            {section.type === 'customText' && section.isList && renderCustomTextItemForm(item as CustomTextEntry, section.type, item, section.id)}
          </Card>
        ))}

        {!section.isList && section.items.length > 0 && (section.type === 'summary' || (section.type === 'customText' && !section.isList)) &&
          renderCustomTextItemForm(section.items[0] as CustomTextEntry, section.type, section.items[0], section.id)
        }

        {section.isList && (
          <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
            <PlusCircle size={16} className="mr-2" /> Add Item
          </Button>
        )}
      </>
    );
  };
  
  const getAIFieldProps = (uniqueFieldId: string, currentValue: string | undefined, sectionType: SectionType, currentItem: SectionItem | {fieldName: string}, currentSectionId: string | null) => {
    const isThisFieldBeingImproved = fieldBeingImproved?.uniqueFieldId === uniqueFieldId;
    return {
      id: uniqueFieldId,
      value: isThisFieldBeingImproved && improvementAISuggestion !== null ? fieldBeingImproved!.originalText : (currentValue || ''),
      onValueChange: (newValue: string) => { 
        const { isPersonal, fieldName, itemId: currentItemId, sectionType: currentItemSectionType } = deconstructUniqueFieldId(uniqueFieldId);
        if (isPersonal && fieldName) {
          handlePersonalDetailsFieldChange(fieldName as keyof PersonalDetails, newValue);
        } else if (currentItemId && fieldName && currentItemSectionType) {
          handleItemChange(currentItemId, fieldName, newValue, currentItemSectionType);
        }
      },
      currentAiPrompt: aiPrompt,
      onAiPromptChange: setAiPrompt,
      onImproveRequest: () => handleImproveWithAI(currentValue || '', uniqueFieldId),
      isImproving: isImproving && isThisFieldBeingImproved,
      forcedSuggestion: isThisFieldBeingImproved ? improvementAISuggestion : null,
      onAcceptForcedSuggestion: () => onAcceptAIImprovement(uniqueFieldId),
      onRejectForcedSuggestion: onRejectAIImprovement,
      userJobTitle: resumeData.personalDetails.jobTitle,
      sectionType,
      currentItem,
      allResumeSections: resumeData.sections, 
      currentSectionId, 
      isAutocompleteEnabled: isAutocompleteEnabled,
    };
  };

  const renderExperienceItemForm = (item: ExperienceEntry, sectionType: SectionType, currentItem: SectionItem, sectionId: string) => (
    <>
      <FieldInput label="Job Title" id={`jobTitle_${item.id}`} value={item.jobTitle} onChange={e => handleItemChange(item.id, 'jobTitle', e.target.value, sectionType)} />
      <FieldInput label="Company" id={`company_${item.id}`} value={item.company} onChange={e => handleItemChange(item.id, 'company', e.target.value, sectionType)} />
      <div className="grid grid-cols-2 gap-2">
        <FieldInput label="Start Date" id={`startDate_${item.id}`} value={item.startDate} onChange={e => handleItemChange(item.id, 'startDate', e.target.value, sectionType)} />
        <FieldInput label="End Date" id={`endDate_${item.id}`} value={item.endDate} onChange={e => handleItemChange(item.id, 'endDate', e.target.value, sectionType)} />
      </div>
      <AIFieldTextarea
        label="Description"
        {...getAIFieldProps(constructUniqueFieldId(false, 'description', item.id, sectionType), item.description, sectionType, currentItem, sectionId)}
      />
    </>
  );

  const renderEducationItemForm = (item: EducationEntry, sectionType: SectionType, currentItem: SectionItem, sectionId: string) => (
    <>
      <FieldInput label="Degree" id={`degree_${item.id}`} value={item.degree} onChange={e => handleItemChange(item.id, 'degree', e.target.value, sectionType)} />
      <FieldInput label="Institution" id={`institution_${item.id}`} value={item.institution} onChange={e => handleItemChange(item.id, 'institution', e.target.value, sectionType)} />
      <FieldInput label="Graduation Year" id={`graduationYear_${item.id}`} value={item.graduationYear} onChange={e => handleItemChange(item.id, 'graduationYear', e.target.value, sectionType)} />
      <AIFieldTextarea
        label="Details (Optional)"
        {...getAIFieldProps(constructUniqueFieldId(false, 'details', item.id, sectionType), item.details, sectionType, currentItem, sectionId)}
      />
    </>
  );

  const renderSkillItemForm = (item: SkillEntry, sectionType: SectionType, currentItem: SectionItem, sectionId: string) => (
     <AIFieldTextarea
        label="Skill Name"
        className="min-h-[40px]"
        placeholder="Enter skill..."
        {...getAIFieldProps(constructUniqueFieldId(false, 'name', item.id, sectionType), item.name, sectionType, currentItem, sectionId)}
      />
  );

  const renderCustomTextItemForm = (item: CustomTextEntry, sectionType: SectionType, currentItem: SectionItem, sectionId: string) => (
    <AIFieldTextarea
        label="Content"
        {...getAIFieldProps(constructUniqueFieldId(false, 'content', item.id, sectionType), item.content, sectionType, currentItem, sectionId)}
      />
  );

  const editorTitle = isCurrentlyEditingPersonalDetails ? "Personal Details" : (localData && 'title' in localData ? (localData as Section).title : "Edit Section");

  return (
    <Card className="sticky top-[calc(theme(spacing.16)+1rem)] max-h-[calc(100vh-theme(spacing.16)-2rem)] flex flex-col no-print">
      <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
        <CardTitle className="font-headline text-lg">{editorTitle}</CardTitle>
        <div className="flex items-center gap-2">
            {targetToEdit !== 'personalDetails' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="autocomplete-toggle"
                  className="autocomplete-toggle-switch"
                  checked={isAutocompleteEnabled}
                  onCheckedChange={onToggleAutocomplete}
                  aria-label="Toggle Autocomplete"
                />
                <Label htmlFor="autocomplete-toggle" className="text-xs cursor-pointer">Autocomplete</Label>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onCloseEditor} aria-label="Close editor">
                <XCircle size={20} />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 overflow-y-auto flex-grow">
        {isCurrentlyEditingPersonalDetails ? renderPersonalDetailsForm() : renderSectionForm()}
      </CardContent>
      <CardFooter className="border-t p-3">
        <Button onClick={handleSaveChanges} size="sm" className="w-full">
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

const FieldInput = ({ label, id, value, onChange, type = "text" }: { label: string, id: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, type?: string }) => (
  <div>
    <Label htmlFor={id} className="block mb-1">{label}</Label>
    <Input type={type} id={id} name={id} value={value || ''} onChange={onChange} className="text-sm" />
  </div>
);

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
  allResumeSections: Section[]; 
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
  
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="block mb-1">{label}</Label>
      <AutocompleteTextarea
        id={id} 
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
