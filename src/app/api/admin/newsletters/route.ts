import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/admin/newsletters - List all newsletters for admins
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const newsletters = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(newsletters);
    } catch (error) {
        console.error('Error fetching admin newsletters:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/newsletters - Create a new newsletter draft
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newsletter = await prisma.newsletter.create({
            data: {
                title,
                content,
                authorId: user.id,
                status: 'draft'
            }
        });

        return NextResponse.json(newsletter);
    } catch (error) {
        console.error('Error creating newsletter draft:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
