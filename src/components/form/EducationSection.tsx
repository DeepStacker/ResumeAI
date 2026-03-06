import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput } from '@/components/DebouncedInput';

export function EducationSection() {
  const { data, updateEducation, addEducation, removeEducation } = useResumeStore();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-500 animate-fade-in">
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-header">
            <span className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-4 relative group transition-colors hover:border-primary/50-number">#{idx + 1}</span>
            {data.education.length > 1 && (
              <button type="button" onClick={() => removeEducation(edu.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-50 group-hover:opacity-100"><Trash2 size={14} /></button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Degree / Program</label>
              <DebouncedInput
                type="text"
                value={edu.degree}
                onChangeValue={(val) => updateEducation(edu.id, 'degree', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="B.S. Computer Science"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Institution</label>
              <DebouncedInput
                type="text"
                value={edu.institution}
                onChangeValue={(val) => updateEducation(edu.id, 'institution', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Stanford University"
                delay={250}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Year</label>
              <DebouncedInput
                type="text"
                value={edu.year}
                onChangeValue={(val) => updateEducation(edu.id, 'year', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="2020"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">GPA (optional)</label>
              <DebouncedInput
                type="text"
                value={edu.gpa}
                onChangeValue={(val) => updateEducation(edu.id, 'gpa', val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="3.9/4.0"
                delay={250}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2-sm">Coursework (optional)</label>
              <DebouncedInput
                type="text"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(edu as any).coursework || ''}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChangeValue={(val) => updateEducation(edu.id, 'coursework' as any, val)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Data Structures, ML, Databases"
                delay={250}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 full-width"><Plus size={16} /> Add Education</button>
    </div>
  );
}
