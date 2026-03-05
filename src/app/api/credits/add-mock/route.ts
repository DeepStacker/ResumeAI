import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addCredits } from '@/lib/credits';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // Mock purchase flow
        const result = await addCredits(userId, amount, 'PURCHASE', `Top up: ${amount} Credits`);

        if (result.success) {
            return NextResponse.json({ success: true, remaining: result.remaining });
        } else {
            return NextResponse.json({ error: 'Failed to add credits.' }, { status: 500 });
        }

    } catch (err) {
        console.error('Add credits mock error:', err);
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
    }
}
