import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { field, value, target_role } = body;

        if (!field || !value) {
            return NextResponse.json({ suggestion: '' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        const fieldPrompts: Record<string, string> = {
            skills: `The candidate is targeting "${target_role || 'a professional role'}". They have listed these skills: "${value}". Suggest 5-8 additional highly relevant skills they should add, formatted as a comma-separated list. Include both technical and soft skills relevant to the role. Output ONLY the suggested skills.`,

            experience: `The candidate is targeting "${target_role || 'a professional role'}". They wrote this experience: "${value}". Rewrite into 3-4 powerful achievement-driven bullet points using the Google XYZ formula (Accomplished [X] measured by [Y] by doing [Z]). Use strong ATS keywords. Output ONLY the improved bullet points.`,

            education: `The candidate wrote this education: "${value}". They target "${target_role || 'a professional role'}". Suggest relevant certifications, courses, or skills they should add. Be concise. Output ONLY suggestions.`,

            summary: `Based on this candidate profile:\n${value}\n\nWrite a compelling 2-3 sentence professional summary for a "${target_role || 'professional'}" role. It should be achievement-focused, mention years of experience if inferable, highlight key strengths, and include ATS keywords. Output ONLY the summary paragraph, no quotes or labels.`,

            bullets: `Rewrite this work experience bullet point to be more impactful using the Google XYZ formula (Accomplished [X] measured by [Y] by doing [Z]): "${value}". The target role is "${target_role || 'a professional role'}". Use strong action verbs and ATS keywords. Output ONLY the improved bullet point.`,
        };

        const prompt = fieldPrompts[field];
        if (!prompt) return NextResponse.json({ suggestion: '' });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "google/gemma-3-4b-it:free",
                temperature: 0.5,
                max_tokens: 400,
                messages: [
                    { role: 'user', content: 'You are a concise career advisor. Give short, actionable suggestions. No explanations or preamble.\n\n' + prompt },
                ],
            }),
        });

        if (!response.ok) return NextResponse.json({ suggestion: '' });

        const data = await response.json();
        const suggestion = data.choices?.[0]?.message?.content?.trim() || '';

        return NextResponse.json({ suggestion });
    } catch {
        return NextResponse.json({ suggestion: '' });
    }
}
