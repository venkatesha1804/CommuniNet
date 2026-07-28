import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

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
    console.warn('RESEND_API_KEY is not set. Email not sent.');
    console.log('Target users:', to.length);
    console.log('Subject:', subject);
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CommuNet <newsletter@onrender.com>', // User should update this with their verified domain
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
          ${html}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <footer style="font-size: 12px; color: #94a3b8; text-align: center;">
            <p>You received this because you are a verified member of CommuNet.</p>
            <p><a href="{{UNSUBSCRIBE_LINK}}" style="color: #64748b; text-decoration: underline;">Unsubscribe from newsletters</a></p>
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
