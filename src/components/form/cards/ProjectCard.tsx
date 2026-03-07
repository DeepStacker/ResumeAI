import React from 'react';
import { Trash2, Loader2, Sparkles, ChevronUp, ChevronDown, FolderGit2 } from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { ProjectEntry } from '@/types/resume';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface ProjectCardProps {
  proj: ProjectEntry;
  idx: number;
  totalEntries: number;
  loadingSuggestion: string | null;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof ProjectEntry, value: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onRewriteDesc: (id: string, desc: string) => void;
  onSuggestTechStack: (id: string, desc: string) => void;
}

export function ProjectCard({
  proj,
  idx,
  totalEntries,
  loadingSuggestion,
  onRemove,
  onUpdate,
  onMove,
  onRewriteDesc,
  onSuggestTechStack,
}: ProjectCardProps) {
  return (
    <AccordionItem value={proj.id} className="rounded-xl border bg-card text-card-foreground shadow-sm group transition-colors hover:border-primary/50 overflow-hidden">
      <div className="flex items-center justify-between pr-4 bg-muted/20">
        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-5 py-4 w-full justify-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <FolderGit2 size={18} />
          </div>
          <div className="flex flex-col items-start gap-1 text-left min-w-0">
            <span className="font-semibold truncate w-full">{proj.name || 'New Project'}</span>
            <span className="text-sm text-muted-foreground font-normal truncate w-full">{proj.techStack || 'Tech Stack'}</span>
          </div>
        </AccordionTrigger>
        <div className="flex gap-1 ml-4 shrink-0">
          {totalEntries > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMove(proj.id, 'up'); }}
                disabled={idx === 0}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors hover:bg-accent text-muted-foreground opacity-50 group-hover:opacity-100 disabled:opacity-30"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMove(proj.id, 'down'); }}
                disabled={idx === totalEntries - 1}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors hover:bg-accent text-muted-foreground opacity-50 group-hover:opacity-100 disabled:opacity-30"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(proj.id); }}
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
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Project Name</label>
          <DebouncedInput
            type="text"
            value={proj.name}
            onChangeValue={(val) => onUpdate(proj.id, 'name', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="AI Resume Builder"
            delay={250}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Tech Stack</label>
            <AIBadge 
              label="AI Auto-fill" 
              type="generate"
              onClick={() => onSuggestTechStack(proj.id, proj.description)}
              loading={loadingSuggestion === proj.id + '_tech'}
              disabled={!proj.description}
            />
          </div>
          <DebouncedInput
            type="text"
            value={proj.techStack}
            onChangeValue={(val) => onUpdate(proj.id, 'techStack', val)}
            className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="React, Next.js, Python"
            delay={250}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Description</label>
          <AIBadge 
            label="AI Rewrite" 
            type="rewrite"
            onClick={() => onRewriteDesc(proj.id, proj.description)}
            loading={loadingSuggestion === proj.id}
            disabled={!proj.description}
          />
        </div>
        <DebouncedTextarea
          value={proj.description}
          onChangeValue={(val) => onUpdate(proj.id, 'description', val)}
          className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={2}
          placeholder="Built a full-stack application that..."
          delay={250}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3">Link</label>
        <DebouncedInput
          type="url"
          value={proj.link}
          onChangeValue={(val) => onUpdate(proj.id, 'link', val)}
          className="flex w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="https://github.com/..."
          delay={250}
        />
      </div>
      </AccordionContent>
    </AccordionItem>
  );
}
