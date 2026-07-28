import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/newsletters - Fetch all sent newsletters (Archive)
export async function GET(req: NextRequest) {
    try {
        const newsletters = await prisma.newsletter.findMany({
            where: {
                status: 'sent'
            },
            orderBy: {
                sentAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                content: true,
                sentAt: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json(newsletters);
    } catch (error) {
        console.error('Error fetching newsletters archive:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
