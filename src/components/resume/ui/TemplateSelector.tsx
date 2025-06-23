"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { templates, type TemplateInfo } from "@/types/resume";
import { CheckCircle } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useResumeStore } from '@/stores/resumeStore';

interface TemplateSelectorProps {
  // No props needed anymore
}

export default function TemplateSelector({}: TemplateSelectorProps) {
  const selectedTemplateId = useResumeStore(state => state.selectedTemplateId);
  const setSelectedTemplateId = useResumeStore(state => state.setSelectedTemplateId);
  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Select Template</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {templates.map((template: TemplateInfo) => (
              <Card
                key={template.id}
                className={`w-[180px] h-[260px] cursor-pointer transition-all duration-200 hover:shadow-xl relative flex-shrink-0 ${
                  selectedTemplateId === template.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "ring-1 ring-border"
                }`}
                onClick={() => setSelectedTemplateId(template.id)}
                role="button"
                aria-pressed={selectedTemplateId === template.id}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTemplateId(template.id); }}
              >
                <CardContent className="p-2 flex flex-col items-center justify-center h-full">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    width={150}
                    height={212} // Approx A4 aspect ratio for thumbnail
                    className="rounded-sm object-cover border"
                    data-ai-hint={template.dataAiHint}
                  />
                  <p className="mt-2 text-sm font-medium text-center truncate w-full px-1">
                    {template.name}
                  </p>
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    