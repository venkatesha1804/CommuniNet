import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, message } = body;

    const result = await sendContactEmail({
      name,
      email,
      phone,
      message,
    });

    if (!result.success) {
  console.error("Contact email error:", result.error);

  return NextResponse.json(
    {
      success: false,
      message: "Failed to send email.",
      error: result.error,
    },
    { status: 500 }
  );
}

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}