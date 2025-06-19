"use client";

import React from 'react'; // Removed useState as it's not used directly here anymore
import type { ResumeData, ResumeSection, SectionType } from '@/types/resume';
import { isExtendedResumeData, isLegacyResumeData } from '@/types/resume';
import type { DynamicResumeSection } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Removed ScrollArea
import { GripVertical, Eye, EyeOff, PlusCircle, ArrowUp, ArrowDown, Edit3, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; 
import { sectionIconMap } from '@/types/resume';
import { SchemaRegistry } from '@/lib/schemaRegistry';

interface SectionManagerProps {
  resumeData: ResumeData;
  onUpdateResumeData: (updatedData: ResumeData) => void;
  onEditSection: (sectionId: string | 'personalDetails') => void;
}

const getIconComponent = (iconName: string): React.ElementType => {
  return (LucideIcons as any)[iconName] || LucideIcons.FileText;
};

export default function SectionManager({ resumeData, onUpdateResumeData, onEditSection }: SectionManagerProps) {
  const schemaRegistry = SchemaRegistry.getInstance();
  
  const handleToggleVisibility = (sectionId: string) => {
    if (isLegacyResumeData(resumeData)) {
      const updatedSections = resumeData.sections.map(s =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      );
      onUpdateResumeData({ ...resumeData, sections: updatedSections });
    } else {
      // Handle ExtendedResumeData
      const updatedSections = resumeData.sections.map(s =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      );
      onUpdateResumeData({ ...resumeData, sections: updatedSections });
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...resumeData.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Swap elements
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    onUpdateResumeData({ ...resumeData, sections });
  };
  
  const handleAddSection = (schemaId: string) => {
    const sectionSchema = schemaRegistry.getSectionSchema(schemaId);
    if (!sectionSchema) return;

    const newSectionId = `${schemaId}_${Date.now()}`;
    
    // Check if this is a legacy section type
    if (schemaRegistry.isLegacySectionType(schemaId) && isLegacyResumeData(resumeData)) {
      const type = schemaId as SectionType;
      let newSection: ResumeSection;

      switch (type) {
        case 'summary': 
        case 'customText':
          newSection = { 
            id: newSectionId, 
            title: sectionSchema.name, 
            type: "customText", 
            visible: true, 
            isList: false, 
            items: [{id: `custom_content_${Date.now()}`, content: "New section content..."}] 
          };
          break;
        case 'experience':
          newSection = { id: newSectionId, title: sectionSchema.name, type, visible: true, isList: true, items: [] };
          break;
        case 'education':
          newSection = { id: newSectionId, title: sectionSchema.name, type, visible: true, isList: true, items: [] };
          break;
        case 'skills':
          newSection = { id: newSectionId, title: sectionSchema.name, type, visible: true, isList: true, items: [] };
          break;
        default:
          return; 
      }
      const updatedSections = [...resumeData.sections, newSection];
      onUpdateResumeData({ ...resumeData, sections: updatedSections });
    } else {
      // Create new dynamic section
      const newDynamicSection: DynamicResumeSection = {
        id: newSectionId,
        schemaId: schemaId,
        title: sectionSchema.name,
        visible: true,
        items: [],
        metadata: {
          customTitle: false,
          aiOptimized: false
        }
      };

      // If working with legacy data, convert to extended format
      if (isLegacyResumeData(resumeData)) {
        const extendedData = {
          personalDetails: resumeData.personalDetails,
          sections: [...resumeData.sections, newDynamicSection],
          templateId: resumeData.templateId,
          schemaVersion: '1.0.0',
          metadata: {
            lastAIReview: new Date().toISOString(),
            aiOptimizationLevel: 'basic' as const
          }
        };
        onUpdateResumeData(extendedData);
      } else {
        const updatedSections = [...resumeData.sections, newDynamicSection];
        onUpdateResumeData({ ...resumeData, sections: updatedSections });
      }
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    const updatedSections = resumeData.sections.filter(s => s.id !== sectionId);
    onUpdateResumeData({ ...resumeData, sections: updatedSections });
  };

  // Get available section types from schema registry
  const availableSectionTypes = schemaRegistry.getAllSectionSchemas();

  // Helper function to get section icon
  const getSectionIcon = (section: ResumeSection | DynamicResumeSection) => {
    if ('type' in section) {
      // Legacy section
      return sectionIconMap[section.type];
    } else {
      // Dynamic section
      const schema = schemaRegistry.getSectionSchema(section.schemaId);
      return schema?.uiConfig?.icon || 'FileText';
    }
  };

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Manage Sections</CardTitle>
      </CardHeader>
      <CardContent className="pr-1"> {/* Removed pr-3 from ScrollArea, CardContent can have a little padding */}
        {/* Personal Details - Fixed */}
        <div className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card">
          <div className="flex items-center gap-2">
            {React.createElement(getIconComponent(sectionIconMap.personalDetails), { className: "h-5 w-5 text-primary" })}
            <span className="font-medium">Personal Details</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onEditSection('personalDetails')} aria-label="Edit Personal Details">
            <Edit3 size={16} />
          </Button>
        </div>
        
        {/* Reorderable Sections */}
        {resumeData.sections.map((section, index) => {
          const iconName = getSectionIcon(section);
          const IconComponent = getIconComponent(iconName);
          const sectionTitle = section.title;
          
          return (
            <div key={section.id} className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card group">
              <div className="flex items-center gap-2 flex-grow min-w-0"> {/* Added flex-grow and min-w-0 for better truncation */}
                <GripVertical size={18} className="text-muted-foreground cursor-grab flex-shrink-0" />
                <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium truncate">{sectionTitle}</span> {/* Removed max-w, truncate should handle it */}
                {/* Show schema indicator for dynamic sections */}
                {'schemaId' in section && (
                  <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                    {section.schemaId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'up')} disabled={index === 0} aria-label="Move section up">
                  <ArrowUp size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'down')} disabled={index === resumeData.sections.length - 1} aria-label="Move section down">
                  <ArrowDown size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEditSection(section.id)} aria-label={`Edit ${sectionTitle}`}>
                  <Edit3 size={16} />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(section.id)} aria-label={section.visible ? `Hide ${sectionTitle}` : `Show ${sectionTitle}`}>
                  {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                 {/* Allow deletion of all sections except summary and personalDetails */}
                 {!('type' in section && section.type === 'summary') && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSection(section.id)} className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${sectionTitle}`}>
                    <Trash2 size={16} />
                  </Button>
                 )}
              </div>
            </div>
          );
        })}
      
        <div className="mt-4">
            <h4 className="font-headline text-md mb-2">Add New Section</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"> {/* Changed to 1 column on small screens */}
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
