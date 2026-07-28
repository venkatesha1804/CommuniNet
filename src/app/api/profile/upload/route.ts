import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cloudinary, { configureCloudinary } from '@/lib/cloudinary'
import { verifyFirebaseToken } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const user = await verifyFirebaseToken(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const userId = user.id

        const formData = await req.formData()
        const file = formData.get('image') as File | null
        if (!file) return NextResponse.json({ message: 'No image provided' }, { status: 400 })

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: 'File too large. Maximum 5MB.' }, { status: 400 })
        }

        // Convert file to Buffer for Cloudinary
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure Cloudinary is configured
        configureCloudinary()

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'profiles',
                    public_id: `${userId}-${Date.now()}`,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        }) as any

        const imageUrl = uploadResponse.secure_url

        // Update user profile image in database
        await prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        })

        return NextResponse.json({ imageUrl, message: 'Profile image updated' })
    } catch (error: any) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            error
        })
        return NextResponse.json({
            message: 'Internal server error',
            details: error.message
        }, { status: 500 })
    }
}
