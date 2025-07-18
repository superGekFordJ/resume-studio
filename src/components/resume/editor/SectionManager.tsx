'use client';

import React from 'react';
import type { DynamicResumeSection } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GripVertical,
  Eye,
  EyeOff,
  PlusCircle,
  Edit3,
  Trash2,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useResumeStore } from '@/stores/resumeStore';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { LucideIcon } from 'lucide-react';
import { SchemaRegistry } from '@/lib/schemaRegistry';

const getIconComponent = (iconName: string): React.ElementType => {
  return (
    (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ||
    LucideIcons.FileText
  );
};

// New Sortable Section Item Component
interface SortableSectionItemProps {
  section: DynamicResumeSection;
  onToggleVisibility: (id: string) => void;
  onSetEditingTarget: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableSectionItem({
  section,
  onToggleVisibility,
  onSetEditingTarget,
  onRemove,
}: SortableSectionItemProps) {
  const schemaRegistry = SchemaRegistry.getInstance();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const schema = schemaRegistry.getSectionSchema(section.schemaId);
  const iconName = schema?.uiConfig?.icon || 'FileText';
  const IconComponent = getIconComponent(iconName);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card group"
    >
      <div className="flex items-center gap-2 flex-grow min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <GripVertical size={18} className="text-muted-foreground" />
        </div>
        <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="font-medium truncate">{section.title}</span>
        <span className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
          {section.schemaId}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSetEditingTarget(section.id)}
          aria-label={`Edit ${section.title}`}
        >
          <Edit3 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(section.id)}
          aria-label={
            section.visible ? `Hide ${section.title}` : `Show ${section.title}`
          }
        >
          {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(section.id)}
          className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Delete ${section.title}`}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

export default function SectionManager() {
  const resumeData = useResumeStore((state) => state.resumeData);
  const updateResumeData = useResumeStore((state) => state.updateResumeData);
  const setEditingTarget = useResumeStore((state) => state.setEditingTarget);
  const reorderSections = useResumeStore((state) => state.reorderSections);
  const schemaRegistry = SchemaRegistry.getInstance();

  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = resumeData.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    updateResumeData((prev) => ({ ...prev, sections: updatedSections }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIndex = resumeData.sections.findIndex(
      (s) => s.id === active.id
    );
    const overIndex = resumeData.sections.findIndex((s) => s.id === over.id);

    if (activeIndex !== overIndex) {
      reorderSections({ fromIndex: activeIndex, toIndex: overIndex });
    }
  };

  const handleAddSection = (schemaId: string) => {
    const sectionSchema = schemaRegistry.getSectionSchema(schemaId);
    if (!sectionSchema) return;

    const newSectionId = `${schemaId}_${Date.now()}`;

    const newDynamicSection: DynamicResumeSection = {
      id: newSectionId,
      schemaId: schemaId,
      title: sectionSchema.name,
      visible: true,
      items:
        sectionSchema.type === 'single'
          ? [
              {
                id: `${schemaId}_item_${Date.now()}`,
                schemaId: schemaId,
                data: {},
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  aiGenerated: false,
                },
              },
            ]
          : [],
      metadata: {
        customTitle: false,
        aiOptimized: false,
      },
    };

    const updatedSections = [...resumeData.sections, newDynamicSection];
    updateResumeData((prev) => ({ ...prev, sections: updatedSections }));
  };

  const handleRemoveSection = (sectionId: string) => {
    const updatedSections = resumeData.sections.filter(
      (s) => s.id !== sectionId
    );
    updateResumeData((prev) => ({ ...prev, sections: updatedSections }));
  };

  const availableSectionTypes = schemaRegistry.getAllSectionSchemas();

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Manage Sections</CardTitle>
      </CardHeader>
      <CardContent className="pr-1">
        {/* Personal Details - Fixed */}
        <div className="flex items-center justify-between p-2 mb-2 border rounded-md shadow-sm bg-card">
          <div className="flex items-center gap-2">
            <LucideIcons.UserCircle2 className="h-5 w-5 text-primary ml-2" />
            <span className="font-medium">Personal Details</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingTarget('personalDetails')}
            aria-label="Edit Personal Details"
          >
            <Edit3 size={16} />
          </Button>
        </div>

        {/* Reorderable Sections */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={resumeData.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {resumeData.sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section as DynamicResumeSection}
                onToggleVisibility={handleToggleVisibility}
                onSetEditingTarget={setEditingTarget}
                onRemove={handleRemoveSection}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div className="mt-4">
          <h4 className="font-headline text-md mb-2">Add New Section</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableSectionTypes.map((schema) => {
              const IconComponent = getIconComponent(
                schema.uiConfig?.icon || 'FileText'
              );
              return (
                <Button
                  key={schema.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection(schema.id)}
                  className="w-full justify-start text-left"
                >
                  <PlusCircle size={16} className="mr-2 flex-shrink-0" />
                  <IconComponent size={16} className="mr-2 flex-shrink-0" />
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
