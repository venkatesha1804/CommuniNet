import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { category, subject, body: messageBody } = body

        if (!category || !subject || !messageBody) {
            return NextResponse.json({ message: 'Category, subject, and body are required' }, { status: 400 })
        }

        const senderEmail = 'Guest'
        let senderName = 'Guest User'
        let userId: string | undefined = undefined

        const user = await getAuthUser(req)
        if (user) {
            userId = user.id
            senderName = user.name || senderEmail
        }

        // Save to Database
        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                category,
                subject,
                body: messageBody,
                status: 'open'
            }
        })

        console.log('--- SUPPORT TICKET SAVED & EMAIL SIMULATED ---')
        console.log(`Ticket ID: ${ticket.id}`)
        console.log(`From: ${senderName}`)
        console.log(`Category: ${category} | Subject: ${subject}`)
        console.log('--------------------------------')

        return NextResponse.json({
            message: 'Support request sent successfully!',
            details: { id: ticket.id, category, subject }
        }, { status: 200 })

    } catch (error) {
        console.error('Support submission failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
