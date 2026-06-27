import { Resend } from 'resend';

let resend: Resend | null = null;

export async function sendEmailOtp(email: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY || 're_9rjcrCM1_JrfAxYimNWyKobo6USaikcFV';
  if (apiKey) {
    if (!resend) resend = new Resend(apiKey);
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Default resend domain
        to: email,
        subject: 'French Touch - رمز التحقق للبريد الإلكتروني',
        html: `<h2>مرحباً!</h2><p>رمز التحقق الخاص بك هو: <strong>${otp}</strong></p>`
      });
      console.log(`[REAL] Email OTP sent to ${email}`);
    } catch(e) {
      console.error("Resend error:", e);
    }
  } else {
    console.log(`[SIMULATION] Email OTP to ${email}: ${otp}`);
  }
}
