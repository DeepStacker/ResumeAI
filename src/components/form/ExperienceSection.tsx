import React from 'react';
import { Trash2, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput } from '@/components/DebouncedInput';
import { WorkEntry } from '@/types/resume';

export function ExperienceSection({
  handleRewriteBullets,
  handleGenerateRoleBullets,
  bulletLoading
}: {
  handleRewriteBullets: (id: string, entry: WorkEntry) => void;
  handleGenerateRoleBullets: (id: string, title: string) => void;
  bulletLoading: string | null;
}) {
  const { data, updateWork, addWorkEntry, removeWorkEntry, updateBullet, removeBullet, addBullet } = useResumeStore();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500 animate-fade-in">
      {data.experience.map((entry, idx) => (
        <div key={entry.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-header">
            <span className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-number">#{idx + 1}</span>
            {data.experience.length > 1 && (
              <button type="button" onClick={() => removeWorkEntry(entry.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-50 group-hover:opacity-100"><Trash2 size={14} /></button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Job Title</label>
              <DebouncedInput
                type="text"
                value={entry.jobTitle}
                onChangeValue={(val) => updateWork(entry.id, 'jobTitle', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Software Engineer"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Company</label>
              <DebouncedInput
                type="text"
                value={entry.company}
                onChangeValue={(val) => updateWork(entry.id, 'company', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Google"
                delay={250}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Location</label>
              <DebouncedInput
                type="text"
                value={entry.location}
                onChangeValue={(val) => updateWork(entry.id, 'location', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mountain View, CA"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Start</label>
              <DebouncedInput
                type="text"
                value={entry.startDate}
                onChangeValue={(val) => updateWork(entry.id, 'startDate', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Jan 2022"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">End</label>
              <DebouncedInput
                type="text"
                value={entry.endDate}
                onChangeValue={(val) => updateWork(entry.id, 'endDate', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Present"
                delay={250}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Achievement Bullets</label>
            {entry.bullets.map((b, bi) => (
              <div key={bi} className="flex items-start gap-3 mb-3">
                <span className="text-primary/50 font-bold mt-2 select-none">▸</span>
                <DebouncedInput
                  type="text"
                  value={b}
                  onChangeValue={(val) => updateBullet(entry.id, bi, val)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Accomplished X by doing Y, resulting in Z..."
                  delay={150}
                />
                {entry.bullets.length > 1 && (
                  <button type="button" onClick={() => removeBullet(entry.id, bi)} className="h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0"><X size={12} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addBullet(entry.id)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium py-2 px-3 text-primary hover:bg-primary/10 transition-colors gap-2 self-start"><Plus size={14} /> Add bullet</button>
            <button type="button" onClick={() => handleRewriteBullets(entry.id, entry)} disabled={bulletLoading === entry.id} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-accent text-accent hover:bg-accent/10 h-8 px-3 gap-1.5" style={{ marginLeft: '1rem', marginTop: '0.2rem' }}>
              {bulletLoading === entry.id ? <><Loader2 size={13} className="spin-icon" /> Rewriting...</> : <><Sparkles size={13} /> AI Rewrite (XYZ)</>}
            </button>
            {entry.jobTitle && (
              <button type="button" onClick={() => handleGenerateRoleBullets(entry.id, entry.jobTitle)} disabled={bulletLoading === entry.id + '_generate'} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-accent text-accent hover:bg-accent/10 h-8 px-3 gap-1.5" style={{ marginLeft: '0.5rem', marginTop: '0.2rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
                {bulletLoading === entry.id + '_generate' ? <><Loader2 size={13} className="spin-icon" /> Thinking...</> : <><Sparkles size={13} /> Generate Ideas</>}
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={addWorkEntry} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 full-width"><Plus size={16} /> Add Work Experience</button>
    </div>
  );
}
