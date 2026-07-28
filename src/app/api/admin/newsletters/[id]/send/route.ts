import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { sendNewsletterEmail } from '@/lib/email';

// POST /api/admin/newsletters/[id]/send
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await context.params;

        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        if (newsletter.status === 'sent') {
            return NextResponse.json({ error: 'Newsletter already sent' }, { status: 400 });
        }

        // 1. Get all verified members who haven't unsubscribed
        const members = await prisma.user.findMany({
            where: {
                status: 'approved',
                unsubscribed: false,
                email: { not: '' }
            },
            select: { email: true }
        });

        const recipientEmails = members.map(m => m.email);

        if (recipientEmails.length === 0) {
            // Still mark as sent even if no recipients
        } else {
            // 2. Send email via Resend
            // Note: For large batches (1000+), consider a background worker/queue.
            // Resend supports batching, but we'll send it as one broadcast for now.
            const result = await sendNewsletterEmail({
                to: recipientEmails,
                subject: newsletter.title,
                html: newsletter.content
            });

            if (!result.success && process.env.RESEND_API_KEY) {
                return NextResponse.json({ error: 'Failed to broadcast email', details: result.error }, { status: 500 });
            }
        }

        // 3. Update newsletter status in DB
        const updated = await prisma.newsletter.update({
            where: { id },
            data: {
                status: 'sent',
                sentAt: new Date()
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error sending newsletter:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
