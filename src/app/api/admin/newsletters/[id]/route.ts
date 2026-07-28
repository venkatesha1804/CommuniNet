import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/admin/newsletters/[id]
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await context.params;

        const newsletter = await prisma.newsletter.findUnique({
            where: { id },
            include: { author: { select: { name: true, email: true } } }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        return NextResponse.json(newsletter);
    } catch (error) {
        console.error('Error fetching admin newsletter:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/newsletters/[id]
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await context.params;

        const { title, content } = await req.json();

        const newsletter = await prisma.newsletter.update({
            where: { id },
            data: { title, content }
        });

        return NextResponse.json(newsletter);
    } catch (error) {
        console.error('Error updating newsletter:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/admin/newsletters/[id]
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await context.params;

        await prisma.newsletter.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
