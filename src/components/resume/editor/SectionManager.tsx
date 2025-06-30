"use client";

import React from 'react';
import type { DynamicResumeSection } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Eye, EyeOff, PlusCircle, ArrowUp, ArrowDown, Edit3, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; 
import { sectionIconMap } from '@/types/resume';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';

interface SectionManagerProps {
  // No props needed anymore
}

const getIconComponent = (iconName: string): React.ElementType => {
  return (LucideIcons as any)[iconName] || LucideIcons.FileText;
};

export default function SectionManager({}: SectionManagerProps) {
  const resumeData = useResumeStore(state => state.resumeData);
  const updateResumeData = useResumeStore(state => state.updateResumeData);
  const setEditingTarget = useResumeStore(state => state.setEditingTarget);
  const schemaRegistry = SchemaRegistry.getInstance();
  
  const handleToggleVisibility = (sectionId: string) => {
      const updatedSections = resumeData.sections.map(s =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      );
      updateResumeData(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...resumeData.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Swap elements
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    updateResumeData(prev => ({ ...prev, sections }));
  };
  
  const handleAddSection = (schemaId: string) => {
    const sectionSchema = schemaRegistry.getSectionSchema(schemaId);
    if (!sectionSchema) return;

    const newSectionId = `${schemaId}_${Date.now()}`;
    
      // Create new dynamic section
      const newDynamicSection: DynamicResumeSection = {
        id: newSectionId,
        schemaId: schemaId,
        title: sectionSchema.name,
        visible: true,
        items: sectionSchema.type === 'single' ? [{
          id: `${schemaId}_item_${Date.now()}`,
          schemaId: schemaId,
          data: {},
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiGenerated: false
          }
        }] : [],
        metadata: {
          customTitle: false,
          aiOptimized: false
        }
      };

        const updatedSections = [...resumeData.sections, newDynamicSection];
        updateResumeData(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleRemoveSection = (sectionId: string) => {
    const updatedSections = resumeData.sections.filter(s => s.id !== sectionId);
    updateResumeData(prev => ({ ...prev, sections: updatedSections }));
  };

  // Get available section types from schema registry
  const availableSectionTypes = schemaRegistry.getAllSectionSchemas();

  // Helper function to get section icon
  const getSectionIcon = (section: DynamicResumeSection) => {
      const schema = schemaRegistry.getSectionSchema(section.schemaId);
      return schema?.uiConfig?.icon || 'FileText';
  };

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Manage Sections</CardTitle>
      </CardHeader>
      <CardContent className="pr-1">
        {/* Personal Details - Fixed */}
        <div className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card">
          <div className="flex items-center gap-2">
            {React.createElement(getIconComponent(sectionIconMap.personalDetails), { className: "h-5 w-5 text-primary" })}
            <span className="font-medium">Personal Details</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditingTarget('personalDetails')} aria-label="Edit Personal Details">
            <Edit3 size={16} />
          </Button>
        </div>
        
        {/* Reorderable Sections */}
        {resumeData.sections.map((section, index) => {
          const iconName = getSectionIcon(section as DynamicResumeSection);
          const IconComponent = getIconComponent(iconName);
          const sectionTitle = section.title;
          
          return (
            <div key={section.id} className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card group">
              <div className="flex items-center gap-2 flex-grow min-w-0">
                <GripVertical size={18} className="text-muted-foreground cursor-grab flex-shrink-0" />
                <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium truncate">{sectionTitle}</span>
                {/* Show schema indicator for dynamic sections */}
                  <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                  {(section as DynamicResumeSection).schemaId}
                  </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'up')} disabled={index === 0} aria-label="Move section up">
                  <ArrowUp size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'down')} disabled={index === resumeData.sections.length - 1} aria-label="Move section down">
                  <ArrowDown size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditingTarget(section.id)} aria-label={`Edit ${sectionTitle}`}>
                  <Edit3 size={16} />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(section.id)} aria-label={section.visible ? `Hide ${sectionTitle}` : `Show ${sectionTitle}`}>
                  {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                 {/* Allow deletion of all sections */}
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSection(section.id)} className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${sectionTitle}`}>
                    <Trash2 size={16} />
                  </Button>
              </div>
            </div>
          );
        })}
      
        <div className="mt-4">
            <h4 className="font-headline text-md mb-2">Add New Section</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableSectionTypes.map(schema => {
                  const IconComponent = getIconComponent(schema.uiConfig?.icon || 'FileText');
                  return (
                    <Button 
                      key={schema.id} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddSection(schema.id)} 
                      className="w-full justify-start text-left"
                    >
                      <PlusCircle size={16} className="mr-2 flex-shrink-0"/> 
                      <IconComponent size={16} className="mr-2 flex-shrink-0"/>
                      <span className="truncate">{schema.name}</span>
                    </Button>
                  );
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
