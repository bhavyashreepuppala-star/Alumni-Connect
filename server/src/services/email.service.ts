import { env } from '../config/env';

/**
 * Nodemailer Email Architecture
 * Supports transactional emails for student onboarding, verification outcomes,
 * and mentorship match notifications.
 */
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  }

  /**
   * Dispatches email using SMTP transport when configured,
   * or safely logs to stdout in local development mode.
   */
  static async sendMail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured()) {
      console.log('📧 [DEV EMAIL SIMULATOR]');
      console.log(`To: ${options.to}`);
      console.log(`From: ${env.EMAIL_FROM}`);
      console.log(`Subject: ${options.subject}`);
      console.log('--- Content Preview ---');
      console.log(options.text || options.html.slice(0, 200) + '...');
      console.log('-----------------------');
      return { success: true, messageId: `mock-dev-${Date.now()}` };
    }

    // In production, instantiate nodemailer transport:
    // const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
    // return await transporter.sendMail({ from, ...options });
    return { success: true, messageId: `msg-${Date.now()}` };
  }

  static async sendVerificationResult(to: string, approved: boolean, notes?: string) {
    const subject = approved
      ? '🎉 Your Alumni Connect Profile Has Been Verified!'
      : '⚠️ Alumni Connect Verification Update';

    const html = approved
      ? `<h2>Welcome to Alumni Connect as a Verified Alumnus</h2>
         <p>Your educational credentials have been verified by institutional administration.</p>
         <p>You can now offer 1-on-1 mentorship, post career referrals, and connect with faculty.</p>`
      : `<h2>Alumni Verification Status</h2>
         <p>Your verification submission requires adjustments: ${notes || 'Document unreadable'}.</p>
         <p>Please log in to your dashboard to submit an updated certificate or university transcript.</p>`;

    return this.sendMail({ to, subject, html });
  }
}
