
"use client";

import React from 'react'; // Removed useState as it's not used directly here anymore
import type { ResumeData, Section, SectionType } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Removed ScrollArea
import { GripVertical, Eye, EyeOff, PlusCircle, ArrowUp, ArrowDown, Edit3, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; 
import { sectionIconMap } from '@/types/resume';


interface SectionManagerProps {
  resumeData: ResumeData;
  onUpdateResumeData: (updatedData: ResumeData) => void;
  onEditSection: (sectionId: string | 'personalDetails') => void;
}

const getIconComponent = (iconName: string): React.ElementType => {
  return (LucideIcons as any)[iconName] || LucideIcons.FileText;
};


export default function SectionManager({ resumeData, onUpdateResumeData, onEditSection }: SectionManagerProps) {
  
  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = resumeData.sections.map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onUpdateResumeData({ ...resumeData, sections: updatedSections });
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
  
  const handleAddSection = (type: SectionType) => {
    const newSectionId = `${type}_${Date.now()}`;
    let newSection: Section;

    switch (type) {
        case 'summary': 
        case 'customText':
            newSection = { id: newSectionId, title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`, type: "customText", visible: true, isList: false, items: [{id: `custom_content_${Date.now()}`, content: "New section content..."}] };
            break;
        case 'experience':
            newSection = { id: newSectionId, title: "New Experience Section", type, visible: true, isList: true, items: [] };
            break;
        case 'education':
            newSection = { id: newSectionId, title: "New Education Section", type, visible: true, isList: true, items: [] };
            break;
        case 'skills':
            newSection = { id: newSectionId, title: "New Skills Section", type, visible: true, isList: true, items: [] };
            break;
        default:
            return; 
    }
    const updatedSections = [...resumeData.sections, newSection];
    onUpdateResumeData({ ...resumeData, sections: updatedSections });
  };

  const handleRemoveSection = (sectionId: string) => {
    const updatedSections = resumeData.sections.filter(s => s.id !== sectionId);
    onUpdateResumeData({ ...resumeData, sections: updatedSections });
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
          const IconComponent = getIconComponent(sectionIconMap[section.type]);
          return (
            <div key={section.id} className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card group">
              <div className="flex items-center gap-2 flex-grow min-w-0"> {/* Added flex-grow and min-w-0 for better truncation */}
                <GripVertical size={18} className="text-muted-foreground cursor-grab flex-shrink-0" />
                <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium truncate">{section.title}</span> {/* Removed max-w, truncate should handle it */}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'up')} disabled={index === 0} aria-label="Move section up">
                  <ArrowUp size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleMoveSection(section.id, 'down')} disabled={index === resumeData.sections.length - 1} aria-label="Move section down">
                  <ArrowDown size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEditSection(section.id)} aria-label={`Edit ${section.title}`}>
                  <Edit3 size={16} />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(section.id)} aria-label={section.visible ? `Hide ${section.title}` : `Show ${section.title}`}>
                  {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                 {!section.type.match(/summary|personalDetails/) && ( 
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSection(section.id)} className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Delete ${section.title}`}>
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
                {(['experience', 'education', 'skills', 'customText'] as SectionType[]).map(type => (
                     <Button key={type} variant="outline" size="sm" onClick={() => handleAddSection(type)} className="w-full justify-start text-left">
                        <PlusCircle size={16} className="mr-2 flex-shrink-0"/> 
                        <span className="truncate">{type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
