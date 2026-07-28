import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import cloudinary, { configureCloudinary } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
    try {
        // Unified Authentication (Firebase or Legacy Cookie)
        const user = await getAuthUser(req)
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
        }

        // Validate basic image types
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Only images are allowed' }, { status: 400 })
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
                    folder: 'uploads',
                    public_id: `upload-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        }) as any

        const publicUrl = uploadResponse.secure_url

        return NextResponse.json({ url: publicUrl })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
