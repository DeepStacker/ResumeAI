import React from 'react';
import { Trash2, ChevronUp, ChevronDown, GraduationCap } from 'lucide-react';
import { DebouncedInput } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { EducationEntry } from '@/types/resume';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface EducationCardProps {
  edu: EducationEntry;
  idx: number;
  totalEntries: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof EducationEntry | 'coursework', value: any) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  handleSuggestCoursework?: (eduId: string, degree: string) => void;
  loadingSuggestion?: string | null;
}

export function EducationCard({
  edu,
  idx,
  totalEntries,
  onRemove,
  onUpdate,
  onMove,
  handleSuggestCoursework,
  loadingSuggestion,
}: EducationCardProps) {
  return (
    <AccordionItem value={edu.id} className="rounded-xl border bg-card text-card-foreground shadow-sm group transition-colors hover:border-primary/50 overflow-hidden">
      <div className="flex items-center justify-between pr-4 bg-muted/20">
        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-5 py-4 w-full justify-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <GraduationCap size={18} />
          </div>
          <div className="flex flex-col items-start gap-1 text-left min-w-0">
            <span className="font-semibold truncate w-full">{edu.degree || 'New Degree'}</span>
            <span className="text-sm text-muted-foreground font-normal truncate w-full">{edu.institution || 'University Name'}</span>
          </div>
        </AccordionTrigger>
        <div className="flex gap-1 ml-4 shrink-0">
          {totalEntries > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMove(edu.id, 'up'); }}
                disabled={idx === 0}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors hover:bg-accent text-muted-foreground opacity-50 group-hover:opacity-100 disabled:opacity-30"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMove(edu.id, 'down'); }}
                disabled={idx === totalEntries - 1}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors hover:bg-accent text-muted-foreground opacity-50 group-hover:opacity-100 disabled:opacity-30"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(edu.id); }}
                className="h-9 w-9 text-base inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-50 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      <AccordionContent className="p-5 pt-4 flex flex-col gap-6 border-t bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Degree / Program</label>
          <DebouncedInput
            type="text"
            value={edu.degree}
            onChangeValue={(val) => onUpdate(edu.id, 'degree', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="B.S. Computer Science"
            delay={250}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Institution</label>
          <DebouncedInput
            type="text"
            value={edu.institution}
            onChangeValue={(val) => onUpdate(edu.id, 'institution', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Stanford University"
            delay={250}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="grid gap-2">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">
            Year
            {edu.year && (edu.year.length !== 4 || isNaN(Number(edu.year))) && (
              <AIBadge 
                label="AI Fix" 
                onClick={() => onUpdate(edu.id, 'year', edu.year.replace(/\D/g, '').substring(0, 4))}
                className="ml-auto"
              />
            )}
          </label>
          <DebouncedInput
            type="text"
            value={edu.year}
            onChangeValue={(val) => onUpdate(edu.id, 'year', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="2020"
            delay={250}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">GPA (optional)</label>
          <DebouncedInput
            type="text"
            value={edu.gpa}
            onChangeValue={(val) => onUpdate(edu.id, 'gpa', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="3.9/4.0"
            delay={250}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Coursework (optional)</label>
            {handleSuggestCoursework && (
              <AIBadge 
                label="AI Suggest" 
                type="generate"
                onClick={() => handleSuggestCoursework(edu.id, edu.degree)}
                loading={loadingSuggestion === edu.id + '_coursework'}
                disabled={!edu.degree}
              />
            )}
          </div>
          <DebouncedInput
            type="text"
            value={edu.coursework || ''}
            onChangeValue={(val) => onUpdate(edu.id, 'coursework', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Data Structures, ML, Databases"
            delay={250}
          />
        </div>
      </div>
      </AccordionContent>
    </AccordionItem>
  );
}
