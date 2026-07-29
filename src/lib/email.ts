import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ===========================
   Newsletter Email
=========================== */

export async function sendNewsletterEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return {
      success: false,
      error: "Resend API key missing",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "CommuNet <onboarding@resend.dev>",
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          ${html}

          <hr style="margin-top:30px;" />

          <p style="font-size:12px;color:#666;">
            You are receiving this email because you are a verified member of CommuNet.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(error);

      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
}

/* ===========================
   Contact Form Email
=========================== */

export async function sendContactEmail({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  if (!resend) {
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  try {
    // ===============================
    // Email to YOU
    // ===============================

    const { error: adminError } = await resend.emails.send({
      from: "CommuNet <onboarding@resend.dev>",
      to: ["venkateshhegde102@gmail.com"],
      subject: `📩 New Contact Form Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2>New Contact Form Submission</h2>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>

          <hr>

          <h3>Message</h3>

          <p>${message}</p>
        </div>
      `,
    });

    if (adminError) {
      console.error(adminError);

      return {
        success: false,
        error: adminError,
      };
    }

    // ===============================
    // Auto Reply to USER
    // ===============================

    const { error: userError } = await resend.emails.send({
      from: "CommuNet <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting CommuNet",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2>Hello ${name}! 👋</h2>

          <p>Thank you for contacting <strong>CommuNet</strong>.</p>

          <p>We have successfully received your message and our team will get back to you as soon as possible.</p>

          <hr>

          <h3>Your Message</h3>

          <p>${message}</p>

          <br>

          <p>Best Regards,</p>

          <h3>CommuNet Team</h3>
        </div>
      `,
    });

    if (userError) {
      console.error(userError);

      return {
        success: false,
        error: userError,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error,
    };
  }
}