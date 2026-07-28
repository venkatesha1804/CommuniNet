import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // 1. Create Admins & Regular Users
    console.log('Seeding Users...')
    const admin = await prisma.user.upsert({
        where: { email: 'admin@communet.com' },
        update: {},
        create: {
            email: 'admin@communet.com',
            name: 'Main Admin',
            password,
            mobile: '9999999999',
            role: 'admin',
            status: 'approved'
        },
    })

    const users = []
    for (let i = 1; i <= 40; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@example.com` },
            update: {},
            create: {
                email: `user${i}@example.com`,
                name: `Community Member ${i}`,
                password,
                mobile: `88888888${i.toString().padStart(2, '0')}`,
                role: 'member',
                status: i % 5 === 0 ? 'pending' : 'approved',
                location: ['Hyderabad', 'Bangalore', 'Chennai', 'Vijayawada', 'Vishakhapatnam'][i % 5],
                gotra: ['Vasavi', 'Janaka', 'Kashyapa', 'Bharadwaja'][i % 4]
            },
        })
        users.push(user)
    }

    // 2. Businesses
    console.log('Seeding Businesses...')
    const businessCategories = ['Retail', 'Manufacturing', 'IT Services', 'Consulting', 'Real Estate']
    for (let i = 1; i <= 40; i++) {
        await prisma.business.create({
            data: {
                ownerId: users[i % 40].id,
                name: `Local ${businessCategories[i % 5]} ${i}`,
                description: `Leading provider of ${businessCategories[i % 5].toLowerCase()} services in the region since 199${i % 10}.`,
                category: businessCategories[i % 5],
                city: users[i % 40].location || 'Hyderabad',
                status: i % 7 === 0 ? 'pending' : 'approved',
                contact: `91000000${i.toString().padStart(2, '0')}`,
            }
        })
    }

    // 3. Events
    console.log('Seeding Events...')
    for (let i = 1; i <= 40; i++) {
        const eventDate = new Date()
        eventDate.setDate(eventDate.getDate() + (i * 5) - 30) // Mix of past and future
        await prisma.event.create({
            data: {
                organizerId: admin.id,
                title: `Community Meetup ${i}`,
                description: `Annual gathering for community growth and networking in ${users[i % 40].location || 'the city'}.`,
                date: eventDate,
                location: users[i % 40].location || 'Community Hall',
                status: i % 8 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 4. Jobs
    console.log('Seeding Jobs...')
    const jobTitles = ['Software Engineer', 'Accountant', 'Sales Manager', 'Operations Lead', 'Marketing Specialist']
    for (let i = 1; i <= 40; i++) {
        await prisma.job.create({
            data: {
                posterId: users[i % 40].id,
                title: jobTitles[i % 5],
                company: `Acme Corp ${i}`,
                location: users[i % 20].location || 'Remote',
                type: ['Full-time', 'Part-time', 'Remote'][i % 3],
                salary: `${4 + (i % 5)}L - ${8 + (i % 5)}L PA`,
                description: `Looking for an experienced ${jobTitles[i % 5].toLowerCase()} to join our growing team.`,
                status: i % 6 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 5. Donations
    console.log('Seeding Donations...')
    const causes = ['Education Fund', 'Medical Relief', 'Temple Construction', 'Community Hall']
    for (let i = 1; i <= 40; i++) {
        await prisma.donation.create({
            data: {
                donorId: users[i % 40].id,
                amount: [1000, 5000, 10000, 25000, 50000][i % 5],
                cause: causes[i % 4],
                status: 'completed',
                transactionId: `TXN${Date.now()}${i}`
            }
        })
    }

    // 6. Scholarships
    console.log('Seeding Scholarships...')
    const scholarshipTypes = ["General", "Merit-based", "Need-based", "Sports", "Arts", "Others"]
    for (let i = 1; i <= 40; i++) {
        const deadline = new Date()
        deadline.setMonth(deadline.getMonth() + 2)
        await prisma.scholarship.create({
            data: {
                posterId: admin.id,
                title: `Merit Scholarship 202${i % 5}`,
                amount: `₹${10000 + (i * 2000)}`,
                type: scholarshipTypes[i % 6],
                eligibility: 'Above 90% in Final Exams',
                description: 'Support for bright students from our community for higher education.',
                deadline: deadline,
                status: i % 10 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 7. Mentorships
    console.log('Seeding Mentorships...')
    const expertises = ['Civil Services', 'Software Development', 'Chartered Accountancy', 'Business Strategy']
    for (let i = 1; i <= 40; i++) {
        await prisma.mentorship.create({
            data: {
                mentorId: users[i % 40].id,
                expertise: expertises[i % 4],
                bio: `Experienced professional with 10+ years in ${expertises[i % 4]}. Happy to guide youngsters.`,
                status: i % 9 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 8. Achievements
    console.log('Seeding Achievements...')
    for (let i = 1; i <= 40; i++) {
        await prisma.achievement.create({
            data: {
                userId: users[i % 40].id,
                title: `Award for Excellence ${i}`,
                description: `Recognized for outstanding contribution to professional and community service.`,
                date: new Date(),
                category: ['Educational', 'Professional', 'Social'][i % 3],
                status: 'approved'
            }
        })
    }

    // 9. Help Requests
    console.log('Seeding Help Requests...')
    const helpTypes = ['Medical Emergency', 'Financial Guidance', 'Career Help', 'Emotional Support']
    for (let i = 1; i <= 40; i++) {
        await prisma.helpRequest.create({
            data: {
                userId: users[i % 40].id,
                type: helpTypes[i % 4],
                title: `Assistance required for ${helpTypes[i % 4]}`,
                description: `Need support regarding ${helpTypes[i % 4].toLowerCase()}. Please reach out if you can help.`,
                contact: `98765432${i.toString().padStart(2, '0')}`,
                status: i % 7 === 0 ? 'pending' : 'approved' // More balanced status
            }
        })
    }

    // 10. Support Tickets
    console.log('Seeding Support Tickets...')
    const ticketCategories = ['Technical', 'Verification', 'Account', 'Other']
    for (let i = 1; i <= 40; i++) {
        await prisma.supportTicket.create({
            data: {
                userId: users[i % 40].id,
                category: ticketCategories[i % 4],
                subject: `Support query regarding ${ticketCategories[i % 4].toLowerCase()}`,
                body: `I am facing some issues with my ${ticketCategories[i % 4].toLowerCase()} settings. Please help.`,
                status: i % 5 === 0 ? 'resolved' : 'open'
            }
        })
    }

    // 11. Accommodations
    console.log('Seeding Accommodations...')
    const accommodationNames = ['Vasavi Student Home', 'Community PG', 'Safe Stay Hostel', 'Elite Living']
    for (let i = 1; i <= 20; i++) {
        await prisma.accommodation.create({
            data: {
                ownerId: users[i % 40].id,
                name: `${accommodationNames[i % 4]} ${i}`,
                type: 'Hostel',
                gender: ['Boys', 'Girls', 'Co-ed'][i % 3],
                location: users[i % 40].location || 'Central Area',
                city: users[i % 40].location || 'Hyderabad',
                amenities: ['AC', 'Wi-Fi', 'Food', 'Laundry', 'Security'].slice(0, 3 + (i % 3)),
                pricing: `₹${5000 + (i % 4) * 1000} - ₹${8000 + (i % 4) * 1000} / month`,
                description: `Comfortable and secure ${['Boys', 'Girls', 'Co-ed'][i % 3].toLowerCase()} hostel with all modern amenities. Ideal for students and young professionals.`,
                contactPhone: `99001122${i.toString().padStart(2, '0')}`,
                contactEmail: `stay${i}@example.com`,
                status: i % 5 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 12. Business Collaborations
    console.log('Seeding Business Collaborations...')
    const collabTitles = ['Tech Platform Partnership', 'Supply Chain Alliance', 'Marketing Joint Venture', 'Retail Expansion']
    for (let i = 1; i <= 15; i++) {
        await prisma.businessCollaboration.create({
            data: {
                authorId: users[i % 40].id,
                title: `${collabTitles[i % 4]} opportunity`,
                description: `Seeking partners for a ${collabTitles[i % 4].toLowerCase()} in the ${users[i % 40].location} region. Highly scalable model.`,
                partnershipType: ['Strategic Alliance', 'Joint Venture', 'Co-founder'][i % 3],
                skillsRequired: ['Management', 'Technical', 'Marketing', 'Legal'].slice(0, 2 + (i % 2)),
                status: i % 4 === 0 ? 'pending' : 'approved'
            }
        })
    }

    // 13. Social Interactions (Likes & Comments)
    console.log('Seeding Social Interactions...')
    const someBusinesses = await prisma.business.findMany({ take: 10, select: { id: true } })
    const someEvents = await prisma.event.findMany({ take: 10, select: { id: true } })

    for (const biz of someBusinesses) {
        // Add likes
        for (let i = 0; i < 5; i++) {
            await prisma.like.upsert({
                where: { userId_contentType_contentId: { userId: users[i].id, contentType: 'business', contentId: biz.id } },
                update: {},
                create: { userId: users[i].id, contentType: 'business', contentId: biz.id }
            })
        }
        // Add comment
        await prisma.comment.create({
            data: {
                userId: users[0].id,
                contentType: 'business',
                contentId: biz.id,
                content: 'Great business! Highly recommended.'
            }
        })
    }

    for (const event of someEvents) {
        // Add likes
        for (let i = 0; i < 3; i++) {
            await prisma.like.upsert({
                where: { userId_contentType_contentId: { userId: users[i].id, contentType: 'event', contentId: event.id } },
                update: {},
                create: { userId: users[i].id, contentType: 'event', contentId: event.id }
            })
        }
    }

    console.log('Seeding completed successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
