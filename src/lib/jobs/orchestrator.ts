import { callAI } from '../ai';
import prisma from '../prisma';
import { logger } from '../logger';

export interface SearchStrategy {
    queries: string[];
    priorityRoles: string[];
    targetPlatforms: string[];
}

export interface DiscoveryResult {
    domain: string;
    url: string;
    label: string;
    reasoning: string;
}

export interface UrlEvaluation {
    url: string;
    category: 'job_desc' | 'hub' | 'article' | 'other';
    confidence: number;
}

/**
 * AI Orchestrator for Job Ingestion
 * 
 * Uses LLM to strategically plan searches, discover new career sites, 
 * and filter results to maximize quality and efficiency.
 */
export class AIOrchestrator {

    /**
     * Strategist: Analyzes database coverage and generates a high-yield search plan.
     */
    static async planSearchStrategy(): Promise<SearchStrategy> {
        try {
            // Get some context from the DB to inform the AI
            const stats = await prisma.$queryRaw`
                SELECT location, count(*) as count 
                FROM "JobPosting" 
                WHERE "isActive" = true 
                GROUP BY location 
                ORDER BY count DESC 
                LIMIT 5
            ` as { location: string, count: number }[];

            const prompt = `
                You are a senior recruitment strategist. Your goal is to maximize the diversity and volume of fresh job listings in our portal.
                
                Current Top Locations in DB: ${JSON.stringify(stats)}
                
                Generate 12 high-priority search queries for Firecrawl.
                
                CRITICAL REQUIREMENT: At least 60% of these queries MUST target:
                - "Summer Internship 2026"
                - "Software Engineering Intern"
                - "Graduate Engineering Trainee"
                - "New Grad 2026"
                - "Entry Level" positions for freshers
                - "Batch of 2025/2026" hiring

                Focus on:
                1. Companies known for hiring interns (Big Tech, high-growth startups).
                2. Gaps in current coverage (Locations: ${JSON.stringify(stats)}).
                3. High-growth sectors (AI, Cybersecurity, Fintech).
                4. Job titles like "Associate", "Junior", "Trainee".
                5. Platforms like "Unstop", "Naukri Campus", "Indeed Internships".

                Return ONLY a JSON object with this structure:
                {
                    "queries": ["query 1", "query 2", ...],
                    "priorityRoles": ["role 1", ...],
                    "targetPlatforms": ["linkedin.com/jobs", "lever.co", ...]
                }
            `;

            const { content } = await callAI({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            });

            const result = JSON.parse(this.extractJson(content));
            return {
                queries: result.queries || [],
                priorityRoles: result.priorityRoles || [],
                targetPlatforms: result.targetPlatforms || []
            };
        } catch (err) {
            logger.error('Orchestrator: Strategy planning failed', err);
            return { queries: [], priorityRoles: [], targetPlatforms: [] };
        }
    }

    /**
     * Discovery: Identifies new high-quality career portals from search results.
     */
    static async discoverCareerHubs(searchResults: any[]): Promise<DiscoveryResult[]> {
        if (!searchResults.length) return [];

        try {
            const dataToAnalyze = searchResults.map(r => ({
                title: r.title,
                url: r.url || r.link,
                snippet: r.snippet || r.content?.substring(0, 200)
            }));

            const prompt = `
                Analyze these search results and identify new, high-quality "Career Portals" or "ATS Hubs" (like Lever, Greenhouse, or specific company career pages).
                
                Exclude: General search engines, generic news sites, or already well-known platforms like LinkedIn/Indeed.
                
                Results: ${JSON.stringify(dataToAnalyze)}

                Return ONLY a JSON array of objects:
                [{
                    "domain": "company.lever.co",
                    "url": "https://company.lever.co",
                    "label": "Company Name",
                    "reasoning": "Briefly why this is a good source"
                }]
            `;

            const { content } = await callAI({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });

            const results = JSON.parse(this.extractJson(content));
            return (Array.isArray(results) ? results : []).map(r => ({
                domain: r.domain,
                url: r.url,
                label: r.label,
                reasoning: r.reasoning
            }));
        } catch (err) {
            logger.error('Orchestrator: Hub discovery failed', err);
            return [];
        }
    }

    /**
     * Filter: Categorizes URLs before they are deep-scraped by Jina.
     */
    static async evaluateUrls(urls: { url: string, title?: string }[]): Promise<UrlEvaluation[]> {
        if (!urls.length) return [];

        try {
            const prompt = `
                Given these URLs and titles, categorize them into:
                - job_desc: Direct individual job description page.
                - hub: A list of many jobs (search results, career portal home).
                - article: News, blog post, or "Top 10 jobs" list (NOT a direct hiring page).
                - other: Irrelevant pages.

                URLs: ${JSON.stringify(urls)}

                Return ONLY a JSON array:
                [{"url": "...", "category": "job_desc", "confidence": 0.9}]
            `;

            const { content } = await callAI({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
            });

            const results = JSON.parse(this.extractJson(content));
            return Array.isArray(results) ? results : [];
        } catch (err) {
            logger.error('Orchestrator: URL evaluation failed', err);
            return urls.map(u => ({ url: u.url, category: 'other', confidence: 0 }));
        }
    }

    private static extractJson(text: string): string {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? match[0] : text;
    }
}
