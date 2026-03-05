import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCredits, deductCredits } from '@/lib/credits';
import prisma from '@/lib/prisma';

// GET: return all ATS scores for the user, grouped by resume
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        const scores = await prisma.atsScore.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                resume: { select: { id: true, title: true } },
            },
        });

        // Also get user's resumes for the "Run Analysis" picker
        const resumes = await prisma.resume.findMany({
            where: { userId },
            select: { id: true, title: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ scores, resumes });
    } catch (err) {
        console.error('ATS tracker GET error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}

// POST: run ATS analysis on a resume + JD, save score
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        const { resumeId, jobDescription } = await req.json();

        if (!resumeId || !jobDescription) {
            return NextResponse.json({ error: 'Resume ID and job description are required' }, { status: 400 });
        }

        // Fetch the resume
        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, userId },
            select: { markdown: true, title: true },
        });

        if (!resume || !resume.markdown) {
            return NextResponse.json({ error: 'Resume not found or empty' }, { status: 404 });
        }

        // Pre-check credits
        const creditCheck = await checkCredits(userId, 'ATS_SCORE');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: `Insufficient credits. Need ${creditCheck.cost}, have ${creditCheck.balance}.` }, { status: 402 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the following resume against the provided job description and return ONLY a valid JSON object with these fields:

{
  "score": <number 0-100>,
  "matched": ["keyword1", "keyword2", ...],
  "missing": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Rules:
- Score 0-100 based on how well the resume matches the JD
- "matched" = keywords/skills found in BOTH resume and JD
- "missing" = important keywords in JD but NOT in resume
- "suggestions" = specific, actionable improvements (max 5)
- Return ONLY valid JSON, no other text

Resume:
---
${resume.markdown.substring(0, 4000)}
---

Job Description:
---
${jobDescription.substring(0, 3000)}
---`;

        const aiResult = await callAI({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 1500,
        });

        let content = aiResult.content;

        // Extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) content = jsonMatch[0];

        try {
            const result = JSON.parse(content);

            // SUCCESS — deduct credits
            await deductCredits(userId, 'ATS_SCORE', `ATS analysis: ${resume.title}`);

            // Save to DB
            const saved = await prisma.atsScore.create({
                data: {
                    resumeId,
                    userId,
                    score: result.score || 0,
                    jdSnippet: jobDescription.substring(0, 500),
                    matched: result.matched || [],
                    missing: result.missing || [],
                    suggestions: result.suggestions || [],
                },
                include: { resume: { select: { id: true, title: true } } },
            });

            return NextResponse.json({ score: saved, result });
        } catch {
            console.error('ATS tracker JSON parse error:', content.substring(0, 200));
            return NextResponse.json({ error: 'AI returned invalid response. Please try again.' }, { status: 500 });
        }
    } catch (err) {
        console.error('ATS tracker POST error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
