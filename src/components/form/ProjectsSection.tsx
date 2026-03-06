import React from 'react';
import { Trash2, Plus, Loader2, Sparkles, Globe } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';

export function ProjectsSection({
  handleRewriteProjectDesc,
  loadingSuggestion
}: {
  handleRewriteProjectDesc: (id: string, desc: string) => void;
  loadingSuggestion: string | null;
}) {
  const { data, updateProject, addProject, removeProject } = useResumeStore();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500 animate-fade-in">
      {data.projects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center gap-2 bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
          <Globe size={24} color="var(--primary)" style={{ opacity: 0.4 }} />
          <p>No projects yet. Add your notable projects to stand out.</p>
        </div>
      )}
      {data.projects.map((proj, idx) => (
        <div key={proj.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-header">
            <span className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-number">#{idx + 1}</span>
            <button type="button" onClick={() => removeProject(proj.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-50 group-hover:opacity-100"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Project Name</label>
              <DebouncedInput
                type="text"
                value={proj.name}
                onChangeValue={(val) => updateProject(proj.id, 'name', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="AI Resume Builder"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Tech Stack</label>
              <DebouncedInput
                type="text"
                value={proj.techStack}
                onChangeValue={(val) => updateProject(proj.id, 'techStack', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="React, Next.js, Python"
                delay={250}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Description</label>
              <button type="button" onClick={() => handleRewriteProjectDesc(proj.id, proj.description)} disabled={loadingSuggestion === proj.id || !proj.description} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-accent text-accent hover:bg-accent/10 h-8 px-3 gap-1.5" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                {loadingSuggestion === proj.id ? <><Loader2 size={12} className="spin-icon" /> Rewriting...</> : <><Sparkles size={12} /> AI Rewrite</>}
              </button>
            </div>
            <DebouncedTextarea
              value={proj.description}
              onChangeValue={(val) => updateProject(proj.id, 'description', val)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              placeholder="Built a full-stack application that..."
              delay={250}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Link</label>
            <DebouncedInput
              type="url"
              value={proj.link}
              onChangeValue={(val) => updateProject(proj.id, 'link', val)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://github.com/..."
              delay={250}
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addProject} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 full-width"><Plus size={16} /> Add Project</button>
    </div>
  );
}
