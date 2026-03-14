'use client';

import React from 'react';
import { 
    Building2, MapPin, DollarSign, TrendingUp, ExternalLink, 
    Plus, Sparkles, Clock, Globe, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { useJobStore } from '@/store/useJobStore';

interface JobCardProps {
    job: any;
    onSave: (id: string) => void;
    onApply: (job: any) => void;
}

export function JobCard({ job, onSave, onApply }: JobCardProps) {
    const { setSelectedJobId } = useJobStore();
    const skills = Array.isArray(job.skills) ? job.skills : [];
    
    // Smart Tags Logic
    const isNew = job.postedAt && (new Date().getTime() - new Date(job.postedAt).getTime() < 86400000 * 2);
    const hasHighSalary = job.salaryMin && job.salaryMin >= 150000;

    return (
        <div className="group relative">
            {/* Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <Card 
                onClick={() => setSelectedJobId(job.id)}
                className="relative bg-zinc-950/40 border-white/5 backdrop-blur-xl rounded-2xl p-4 px-5 transition-all duration-300 group-hover:translate-y-[-2px] group-hover:border-primary/30 cursor-pointer"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                            <Building2 className="text-zinc-500 group-hover:text-primary transition-colors" size={20} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                    {job.title}
                                </h3>
                                {job.isSemantic && (
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[0.6rem] uppercase tracking-tighter py-0">
                                        Neural Match
                                    </Badge>
                                )}
                                {isNew && (
                                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/10 text-[0.6rem] uppercase tracking-tighter py-0">
                                        Fresh
                                    </Badge>
                                )}
                                {hasHighSalary && (
                                    <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/10 text-[0.6rem] uppercase tracking-tighter py-0">
                                        High Value
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-zinc-400 font-medium text-sm">
                                    {job.company}
                                </span>
                                {job.source && (
                                    <Badge variant="outline" className="bg-zinc-900 border-white/5 text-zinc-500 text-[0.6rem] py-0 px-1.5 font-normal">
                                        via {job.source}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onSave(job.id)}
                            className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all"
                        >
                            <Plus size={20} />
                        </Button>
                        <Button 
                            onClick={() => onApply(job)}
                            className="rounded-xl px-5 h-10 bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]"
                        >
                            Apply
                            <ExternalLink size={14} className="ml-2" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900/50 flex items-center justify-center">
                            <MapPin size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] uppercase tracking-wider text-zinc-600 font-bold">Location</span>
                            <span className="text-xs font-semibold text-zinc-300 line-clamp-1">{job.location || 'Remote'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900/50 flex items-center justify-center text-emerald-500/50">
                            <DollarSign size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] uppercase tracking-wider text-zinc-600 font-bold">Salary</span>
                            <span className="text-xs font-semibold text-zinc-300">{job.salary || 'Competitive'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900/50 flex items-center justify-center text-blue-500/50">
                            <Briefcase size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] uppercase tracking-wider text-zinc-600 font-bold">Type</span>
                            <span className="text-xs font-semibold text-zinc-300 capitalize">{job.employmentType || 'Full-time'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900/50 flex items-center justify-center text-purple-500/50">
                            <Clock size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.6rem] uppercase tracking-wider text-zinc-600 font-bold">Posted</span>
                            <span className="text-xs font-semibold text-zinc-300">
                                {job.postedAt ? new Intl.RelativeTimeFormat('en', { style: 'short' }).format(
                                    Math.ceil((new Date(job.postedAt).getTime() - new Date().getTime()) / 86400000), 'day'
                                ).replace('in ', '').replace(' ago', '') + ' ago' : 'Recently'}
                            </span>
                        </div>
                    </div>
                </div>

                {job.description && (
                    <div className="mt-4 text-zinc-500 text-xs line-clamp-2 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                        "{job.description.replace(/[#*`]/g, '').substring(0, 180)}..."
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    {skills.slice(0, 5).map((skill: string) => (
                        <div 
                            key={skill} 
                            className="px-3 py-1 rounded-lg bg-zinc-900/50 text-zinc-400 text-[0.65rem] font-bold uppercase tracking-wider border border-white/5 group-hover:border-primary/20 group-hover:text-zinc-300 transition-colors"
                        >
                            {skill}
                        </div>
                    ))}
                    {skills.length > 5 && (
                        <div className="px-3 py-1 rounded-lg text-zinc-600 text-[0.65rem] font-bold uppercase tracking-wider">
                            +{skills.length - 5} More
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
