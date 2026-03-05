import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCredits } from '@/lib/credits';

const SYSTEM_PROMPT = `You are ResumeAI Career Counselor — a warm, professional, and deeply knowledgeable career advisor.

YOUR TWO JOBS:
A) Gather information to build the user's resume through natural conversation
B) Act as a career mentor — clear doubts, give career advice, suggest career paths, and help users understand their strengths

INFORMATION TO GATHER (through conversation, not interrogation):
1. Name and contact info
2. Target role / career goal
3. Skills (technical and soft)
4. Work experience (titles, companies, dates, achievements)
5. Education (degree, institution, year)
6. Projects (name, tech stack, description)
7. Certifications, languages

CONVERSATION STYLE:
- Ask ONE question at a time — NEVER ask multiple questions in one message
- Keep messages SHORT (2-4 sentences max)
- Be warm, encouraging, and specific
- Acknowledge their answer briefly before moving on
- Use their name once you know it

CAREER GUIDANCE (when user has doubts):
- If they're unsure about career direction → suggest 2-3 paths based on their skills
- If they're confused about job market → give realistic, actionable advice
- If they feel underqualified → highlight transferable skills and growth potential
- If they ask about salary/market → give general guidance based on role + experience
- Always be honest but encouraging

CRITICAL — QUICK REPLY SUGGESTIONS:
After EVERY response, you MUST end with exactly 3 quick-reply suggestions on a new line, formatted as:
[SUGGESTIONS]: "suggestion 1" | "suggestion 2" | "suggestion 3"

These should be contextual, natural responses the user might give. Examples:
- After asking about their role: [SUGGESTIONS]: "Software Engineer" | "Data Analyst" | "Product Manager"
- After asking about skills: [SUGGESTIONS]: "Python, JavaScript, React" | "Java, Spring Boot, SQL" | "Marketing, SEO, Analytics"
- After asking about experience: [SUGGESTIONS]: "2 years at a startup" | "I'm a fresh graduate" | "5+ years in IT"

Make suggestions SPECIFIC and RELEVANT to the conversation context. If they mentioned tech, suggest tech skills. If marketing, suggest marketing skills.

WHEN YOU HAVE ENOUGH INFO (name + target role + some skills + some experience OR education):
Say: "I have a great picture of your background! Click **Generate Resume** below when you're ready."
Then include the JSON block with extracted data in \`\`\`json tags:
\`\`\`json
{
  "ready": true,
  "data": {
    "personal": { "fullName": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
    "summary": "",
    "targetRole": "",
    "skills": [],
    "experience": [{ "jobTitle": "", "company": "", "location": "", "startDate": "", "endDate": "", "bullets": [] }],
    "projects": [{ "name": "", "techStack": "", "description": "", "link": "" }],
    "education": [{ "degree": "", "institution": "", "year": "", "gpa": "" }],
    "certifications": [],
    "languages": [],
    "template": "professional"
  }
}
\`\`\`

IMPORTANT: Never generate the actual resume. Only gather info and provide career guidance.`;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Please sign in to use the chatbot.' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        const { messages, action } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        if (action === 'generate') {
            const creditCheck = await checkCredits(userId, 'GENERATE_RESUME');
            if (!creditCheck.allowed) {
                return NextResponse.json({ error: `Insufficient credits. Need ${creditCheck.cost}, have ${creditCheck.balance}.` }, { status: 402 });
            }
        }

        const chatMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-20),
        ];

        try {
            const aiResult = await callAI({
                messages: chatMessages,
                temperature: 0.7,
                max_tokens: 800,
            });

            // Extract suggestions from the reply
            const reply = aiResult.content;
            let cleanReply = reply;
            let suggestions: string[] = [];

            const sugMatch = reply.match(/\[SUGGESTIONS\]:\s*"([^"]+)"\s*\|\s*"([^"]+)"\s*\|\s*"([^"]+)"/);
            if (sugMatch) {
                suggestions = [sugMatch[1], sugMatch[2], sugMatch[3]];
                cleanReply = reply.replace(/\[SUGGESTIONS\]:.*$/m, '').trim();
            }

            return NextResponse.json({ reply: cleanReply, suggestions });
        } catch (aiErr: any) {
            console.error('Chat AI error:', aiErr.message);
            return NextResponse.json({ error: aiErr.message || 'AI is temporarily unavailable. Please try again.' }, { status: 503 });
        }
    } catch (err) {
        console.error('Chat API error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
