import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json(
        { message: 'Logged out successfully' },
        { status: 200 }
    )

    // Clear the HTTP-only cookie by setting its maxAge to 0
    response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    })

    return response
}
