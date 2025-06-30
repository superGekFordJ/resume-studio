// src/components/resume/SectionEditor.tsx
"use client";

import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { PersonalDetails } from "@/types/resume";
import type { DynamicResumeSection } from '@/types/schema';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import PersonalDetailsEditor from './PersonalDetailsEditor';
import SectionItemEditor from './SectionItemEditor';

interface SectionEditorProps {
  // No props needed anymore
}

export default function SectionEditor({}: SectionEditorProps) {
  const { toast } = useToast();
  const schemaRegistry = SchemaRegistry.getInstance();
  
  // Get state and actions from store
  const resumeData = useResumeStore(state => state.resumeData);
  const editingTarget = useResumeStore(state => state.editingTarget);
  const isAutocompleteEnabled = useResumeStore(state => state.isAutocompleteEnabled);
  const toggleAutocomplete = useResumeStore(state => state.toggleAutocomplete);
  
  // Get data manipulation actions from store
  const updateSectionTitle = useResumeStore(state => state.updateSectionTitle);
  const addSectionItem = useResumeStore(state => state.addSectionItem);
  const removeSectionItem = useResumeStore(state => state.removeSectionItem);
  
  // Derive the current editing data from store state
  const currentEditingData = (() => {
    if (editingTarget === 'personalDetails') {
      return resumeData.personalDetails;
    } else if (editingTarget) {
      return resumeData.sections.find(s => s.id === editingTarget);
    }
    return null;
  })();
  
  // Auto-create item for single type sections if they don't have one
  useEffect(() => {
    if (currentEditingData && 'schemaId' in currentEditingData) {
      const section = currentEditingData as DynamicResumeSection;
      const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
      if (sectionSchema?.type === 'single' && section.items.length === 0) {
        // Auto-create an item for single type sections
        addSectionItem(section.id);
      }
    }
  }, [currentEditingData, addSectionItem, schemaRegistry]);

  const handleSectionTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentEditingData && 'id' in currentEditingData) {
      updateSectionTitle({
        sectionId: currentEditingData.id,
        newTitle: e.target.value
      });
    }
  };

  const handleAddItem = () => {
    if (currentEditingData && 'id' in currentEditingData) {
      addSectionItem(currentEditingData.id);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (currentEditingData && 'id' in currentEditingData) {
      removeSectionItem({
        sectionId: currentEditingData.id,
        itemId
      });
    }
  };

  const handleSaveChanges = () => {
    toast({ title: "Changes Saved", description: "Your resume has been updated." });
    // Note: Changes are already saved in the store immediately, this is just for user feedback
  };

  if (!currentEditingData) {
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
  
  const renderSectionForm = () => {
    if (!currentEditingData || !('title' in currentEditingData)) return null;
    
    const section = currentEditingData as DynamicResumeSection;
    const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
    
    if (!sectionSchema) {
      return <div>Schema not found for {section.schemaId}</div>;
    }
    
    return (
      <>
        <div>
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input id="sectionTitle" value={section.title} onChange={handleSectionTitleChange} />
        </div>

        {/* Render items for list sections */}
        {sectionSchema.type === 'list' && section.items.map((item, index) => (
          <SectionItemEditor
            key={item.id}
            item={item}
            section={section}
            index={index}
            onRemove={() => handleRemoveItem(item.id)}
          />
        ))}
        
        {/* Render single item for single sections */}
        {sectionSchema.type === 'single' && section.items.length > 0 && (
          <SectionItemEditor
            item={section.items[0]}
            section={section}
            index={0}
            onRemove={() => {}} // Single items shouldn't be removable
          />
        )}

        {/* Add item button for list sections */}
        {sectionSchema.type === 'list' && (
          <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
            <PlusCircle size={16} className="mr-2" /> Add Item
          </Button>
        )}
      </>
    );
  };
  
  const editorTitle = isCurrentlyEditingPersonalDetails ? "Personal Details" : (currentEditingData && 'title' in currentEditingData ? currentEditingData.title : "Edit Section");

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
          {isCurrentlyEditingPersonalDetails 
            ? <PersonalDetailsEditor personalDetails={resumeData.personalDetails as PersonalDetails} />
            : renderSectionForm()
          }
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
