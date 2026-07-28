import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/newsletters/[id] - Fetch a single sent newsletter
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const newsletter = await prisma.newsletter.findUnique({
            where: {
                id,
                status: 'sent'
            }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        return NextResponse.json(newsletter);
    } catch (error) {
        console.error('Error fetching newsletter:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
